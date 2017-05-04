"use strict";
var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var emailer = require('../email/emailer.js');
var Intercom = require('intercom-client');
var client = new Intercom.Client({
  token: process.env.INTERCOM_TOKEN
});
var moment = require('moment');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Organism = require('../models/organism_model.js');
var Volunteer = require('../models/volunteer_model.js');
var Activity = require('../models/activity_model.js');
var agenda = require('../lib/agenda.js');

var permissions = require('../middlewares/permissions.js');
var longtermsList = require('../lib/longterms.js').listFromOrganisms;
var rewindSlotString = require('../lib/slot.js').rewindSlotString;
var date = require('../lib/dates/date_browser.js');
var game = require('../lib/badges.js');
var update_intercom = require('../lib/intercom/update_intercom.js');
var ltSubs = require('../lib/subscribe/longterm_subs.js');
const schools_res = require('../res/schools_res.js');
var app = express();

/*GET map page*/
router.get('/volunteer/map', permissions.requireGroup('volunteer'), function(req, res, next) {
  res.setLocale(req.cookies.i18n);
  Activity.find({
    'archived': {
      $ne: true
    },
    'extra': {
      $ne: true
    },
    'validation': true
  }, function(err, activities) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème avec la recherche des bénévolats';
      next(err);
    } else { //Create opps list
      const age = getAge(req.session.volunteer.birthdate);
      let my_school = null;
      if (req.session.volunteer.admin) {
        my_school = req.session.volunteer.admin.school_id;
      };
      console.log('Volunteer age : ' + age);

      var isTooYoung = function(activity) {
        if (activity.min_age) {
          return (activity.min_age <= age);
        } else {
          return true;
        }
      };

      var isNotPassed = function(activity) {
        var days_length = activity.days.filter(function(day) {
          return day.day > Date.now();
        });
        return days_length.length > 0;
      };

      var justMySchool = function(activity) {
        if (activity.school_id) {
          if (my_school) {
            return activity.school_id.toString() == my_school.toString();
          } else {
            return false;
          };
        } else {
          return true;
        }
      };

      let remainingPlaces = function(activity) {
        let remain = (activity.days.filter(function(day) {
          return day.vol_nb > day.applicants.length;
        })).length;
        return remain > 0;
      };

      //If user is under 16, he can't see the activities of unverified organisms
      let acts = {};
      let lt_filter = {};
      if (age < 16) {
        acts = activities.filter(isNotPassed).filter(isTooYoung).filter(justMySchool).filter(remainingPlaces);
        lt_filter = {
          'validation': true,
          'long_terms': {
            '$not': {
              '$size': 0
            }
          }
        };
      } else {
        acts = activities.filter(isNotPassed).filter(isTooYoung).filter(justMySchool).filter(remainingPlaces);
        lt_filter = {
          'validation': true,
          'long_terms': {
            '$not': {
              '$size': 0
            }
          }
        };
      };

      Organism.find(lt_filter, {
        'org_name': true,
        '_id': true,
        'cause': true,
        'long_terms': true,
        'school_id': true,
        'admin_id': true
      }, function(err, organisms) {
        if (err) {
          err.type = 'CRASH';
          err.print = 'Problème avec la recherche des bénévolats';
          next(err);
        } else {
          //Filter organisms authorized to be seen by the volunteer
          const lt_organisms = organisms.filter(function(orga) {
            if (orga.school_id || orga.admin_id) {
              if (orga.school_id) {
                var the_school = orga.school_id;
              } else {
                var the_school = orga.admin_id;
              };
              if (my_school) {
                return the_school.toString() == my_school.toString();
              } else {
                return false;
              }
            } else {
              return true;
            }
          });
          var longterms = longtermsList(lt_organisms, age);
          const hash = require('intercom-client').SecureMode.userHash({
            secretKey: process.env.INTERCOM_SECRET_KEY,
            identifier: req.session.volunteer.email
          });
          console.info('hash : ' + hash);
          console.info('typeof hash : ' + typeof hash);
          let school_name = null;
          if (req.session.volunteer.admin && req.session.volunteer.admin.school_name && req.session.volunteer.admin.school_id) {
            school_name = req.session.volunteer.admin.school_name;
          };
          const first_age_filtered = false;
          let nature_indexes = new Array();
          let sol_indexes = new Array();
          let culture_indexes = new Array();
          let child_indexes = new Array();
          let adult_indexes = new Array();
          longterms.map(function(lt) {
            if (lt.cause == 'Nature') {
              nature_indexes.push(lt.long_term._id);
            } else if (lt.cause == 'Solidarité') {
              sol_indexes.push(lt.long_term._id);
            } else if (lt.cause == 'Sport et Culture') {
              culture_indexes.push(lt.long_term._id);
            } else if (lt.cause == 'Enfance') {
              child_indexes.push(lt.long_term._id);
            }
          });
          acts.map(function(act) {
            if (act.cause == 'Nature') {
              nature_indexes.push(act._id);
            } else if (act.cause == 'Solidarité') {
              sol_indexes.push(act._id);
            } else if (act.cause == 'Sport et Culture') {
              culture_indexes.push(act._id);
            } else if (act.cause == 'Enfance') {
              child_indexes.push(act._id);
            }
          });
          res.render('v_map.jade', {
            session: req.session,
            activities: acts,
            volunteer: req.session.volunteer,
            error: req.query.error,
            success: req.query.success,
            group: req.session.group,
            longterms,
            school_name,
            hash,
            age,
            first_age_filtered,
            nature_indexes,
            sol_indexes,
            culture_indexes,
            child_indexes,
            adult_indexes
          });
        }
      });
    }
  });
});


router.get('/activity/:act_id', function(req, res, next) {
  console.log('In GET to an activity page with act_id:' + req.params.act_id);
  if (req.session.volunteer) {
    //Find organism corresponding to the activity
    Activity.findById(req.params.act_id, function(err, activity) {
      if (err) {
        err.type = 'CRASH'
        err.print = 'Activité non trouvée dans la base de données'
        next(err);
      } else {
        if (activity) {
          Organism.find({
            "events.activities": req.params.act_id
          }, function(err, organism) {
            if (err) {
              err.type = 'CRASH'
              err.print = 'Activité non trouvée dans la base de données'
              next(err);
            } else {
              if (organism) {
                function isRightEvent(event) {
                  return event.activities.indexOf(req.params.act_id) >= 0;
                };

                var event_filtered = organism[0].events.filter(isRightEvent);
                console.log('+++++++++++++++++++++');
                console.log('Event find in organism corresponding to act : ' + event_filtered)
                console.log('+++++++++++++++++++++');
                console.log('Activity : ' + activity);
                res.render('v_activity.jade', {
                  session: req.session,
                  act_id: req.params.act_id,
                  event: event_filtered,
                  organism: organism[0],
                  activity: activity,
                  volunteer: req.session.volunteer,
                  group: req.session.group
                });
              } else {
                let err = {};
                err.type = 'CRASH'
                err.print = 'Activité non trouvée dans la base de données'
                next(err);
              };
            }
          });
        } else {
          let err = {};
          err.type = 'CRASH'
          err.print = 'Activité non trouvée dans la base de données'
          next(err);
        }
      }
    });
  } else {
    res.redirect('/all/activity/' + req.params.act_id);
  }
});


router.get('/longterm/:lt_id', function(req, res, next) {
  console.log('In GET to a longterm page with lt_id:' + req.params.lt_id);
  if (req.session.volunteer) {

    let error = '';
    if (req.query.error) {
      error = req.query.error;
    }
    //Find organism corresponding to the activity
    Organism.findOne({
      "long_terms": {
        "$elemMatch": {
          "_id": req.params.lt_id
        }
      }
    }, function(err, organism) {
      if (err) {
        err.type = 'CRASH'
        err.print = 'Engagement non trouvé dans la base de données'
        next(err);
      } else {
        if (organism) {
          console.log('Organism from longterm : ' + organism);

          function isRightLongterm(long) {
            console.log('long._id == req.params.lt_id : ' + (long._id.toString() == req.params.lt_id.toString()) + long._id + '  ' + req.params.lt_id)
            return long._id.toString() == req.params.lt_id.toString();
          };
          var longterm = organism.long_terms.find(isRightLongterm);
          var slotJSON = rewindSlotString(longterm.slot);
          const alreadySubscribed = longterm.applicants.find(function(app) {
            return app.toString() == req.session.volunteer._id.toString();
          });
          const long_term_in_volunteer = req.session.volunteer.long_terms.find(function(lt) {
            console.log('longterm._id : ' + longterm._id);
            console.log('lt._id : ' + lt._id);
            return longterm._id.toString() == lt._id.toString()
          });

          let student_questions = {};
          let organism_questions = {};
          let student_answers = {};
          let organism_answers = {};
          let status = '';
          console.log('long_term_in_volunteer : ' + long_term_in_volunteer);
          if (long_term_in_volunteer) {
            var hours_pending = long_term_in_volunteer.hours_pending;
            var hours_done = long_term_in_volunteer.hours_done;
            console.log('hours_done : ' + hours_done);
            console.log('hours_pending : ' + hours_pending);
            if (long_term_in_volunteer.student_answers) {
              student_questions = long_term_in_volunteer.student_questions;
              student_answers = long_term_in_volunteer.student_answers;
              organism_answers = long_term_in_volunteer.organism_answers;
              organism_questions = long_term_in_volunteer.organism_questions;
              status = long_term_in_volunteer.status;
            }
          } else {
            var hours_pending = null;
            var hours_done = null;
          };
          res.render('v_longterm.jade', {
            session: req.session,
            lt_id: req.params.lt_id,
            organism: organism,
            longterm: longterm,
            volunteer: req.session.volunteer,
            slotJSON: slotJSON,
            alreadySubscribed: alreadySubscribed,
            hours_done: hours_done,
            hours_pending: hours_pending,
            group: req.session.group,
            student_answers,
            student_questions,
            organism_questions,
            organism_answers,
            status,
            error
          });
        } else {
          let err = {};
          err.type = 'CRASH'
          err.print = 'Engagement non trouvé dans la base de données'
          next(err);
        }
      }
    });
  } else {
    res.redirect('/all/longterm/' + req.params.lt_id);
  }
});


router.post('/volunteer/event/subscribe/:act_id-:activity_day', permissions.requireGroup('volunteer'), function(req, res, next) {
  //Verify the volunteer is not already susbscribed to the activity
  function subscribeToActivity(student_q, organism_q) {
    function isActivity(activity) {
      console.log('Activity day : + ' + Date.parse(activity.day) + Date.parse(req.params.activity_day))
      return ((activity.activity_id.toString() === req.params.act_id) && (Date.parse(activity.day) === Date.parse(req.params.activity_day)));
    };

    var alreadyExists = req.session.volunteer.events.find(isActivity);
    console.log('alreadyExists : ' + alreadyExists + typeof alreadyExists);
    if (typeof alreadyExists === 'undefined') {
      console.log('Act_id which is searched : ' + req.params.act_id);
      console.log('req.params.activity_day : ' + req.params.activity_day);
      console.log('MODIFYING ACTIVITY');
      Activity.findOneAndUpdate({
        "$and": [{
          "_id": req.params.act_id
        }, {
          "days.day": req.params.activity_day
        }]
      }, {
        "$addToSet": {
          "days.$.applicants": req.session.volunteer._id
        }

      }, function(err, newActivity) {
        if (err) {
          err.type = 'CRASH'
          err.print = 'Inscription annulée : problème dans la base de donnée';
          next(err);
        } else {
          if (newActivity) {
            function isGoodDay(day) {
              return (Date.parse(day.day) === Date.parse(req.params.activity_day));
            };
            console.log('Isgood day result : ' + newActivity.days.find(isGoodDay));
            let phone = {};
            let parents_email = {};
            if (req.session.volunteer.phone) {
              phone = req.session.volunteer.phone;
            } else if (req.body.phone) {
              phone = req.body.phone;
            } else {
              phone = null;
            };
            if (req.session.volunteer.parents_email) {
              parents_email = req.session.volunteer.parents_email;
            } else if (req.body.parents_email) {
              parents_email = req.body.parents_email;
            } else {
              parents_email = null;
            };
            const start_time = newActivity.days.find(isGoodDay).start_time;
            const end_time = newActivity.days.find(isGoodDay).end_time;

            console.log('phone : ' + phone);
            Volunteer.findOneAndUpdate({
              "_id": req.session.volunteer._id
            }, {
              "$addToSet": {
                "events": {
                  "activity_id": req.params.act_id,
                  "intitule": newActivity.event_intitule,
                  "address": newActivity.address,
                  "lat": newActivity.lat,
                  "lon": newActivity.lon,
                  "day": req.params.activity_day,
                  "intitule_activity": newActivity.description,
                  "org_id": newActivity.org_id,
                  "org_name": newActivity.org_name,
                  "start_time": start_time,
                  "end_time": newActivity.days.find(isGoodDay).end_time,
                  "email": newActivity.email,
                  "hours_done": 0,
                  "status": 'subscribed',
                  "hours_pending": 0,
                  "student_questions": student_q,
                  "student_answers": [],
                  "organism_questions": organism_q,
                  "organism_answers": []
                }
              },
              "$set": {
                "phone": phone,
                "parents_email": parents_email
              }
            }, {
              returnNewDocument: true,
              new: true
            }, function(err, newVolunteer) {
              if (err) {
                err.type = 'CRASH'
                err.print = 'Inscription annulée : problème dans la base de donnée';
                next(err);
              } else {
                console.log('**********************************');
                console.log('New Volunteer modified : ' + JSON.stringify(newVolunteer));
                console.log('**********************************');

                const dayString = date.printDate(req.params.activity_day);

                console.log('day String ' + dayString);
                console.log('req.params.activity_day ' + req.params.activity_day);
                console.log('**********************************');
                //UPDATING REQ.SESSION.VOLUNTEER
                //SEND REMINDER EMAIL
                sendEmailOneDayBeforeEvent(req.params.activity_day, req.session.volunteer, newActivity, start_time, end_time);
                var success = encodeURIComponent('Vous avez été inscrit à l\'activité avec succès !');
                game.refreshPreferences(newVolunteer, function(err, volunteer_refreshed) {
                  if (err) {
                    err.type = 'MINOR';
                    err.print = 'Problème de mise à jour des préférences du bénévole dans la base de données';
                    next(err);
                  } else {
                    req.session.volunteer = volunteer_refreshed;
                    req.session.save(function() {
                      Organism.findById(newActivity.org_id, function(err, organism) {
                        //Find the event in organism
                        const theEvent = organism.events.find(function(event) {
                          const goodEvent = event.activities.find(function(acti) {
                            console.log('acti and req.params.act_id : ' + acti + '   ' + req.params.act_id);
                            return acti.toString() == req.params.act_id.toString();
                          });
                          return goodEvent;
                        });
                        res.render('v_postsubscription.jade', {
                          session: req.session,
                          org_phone: organism.phone,
                          org_email: organism.email,
                          org_name: newActivity.org_name,
                          day: dayString,
                          link_to_share: '/activity/' + req.params.act_id,
                          start_time: newActivity.days.find(isGoodDay).start_time,
                          end_time: newActivity.days.find(isGoodDay).end_time,
                          address: newActivity.address,
                          volunteer: volunteer_refreshed,
                          group: req.session.group
                        });
                        var org_content = {
                          event: newActivity.event_intitule,
                          recipient: organism.email,
                          name: organism.firstname + ' ' + organism.lastname,
                          link: 'http://' + req.headers.host + '/organism/event/' + theEvent._id,
                          customMessage: [req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname + ' (' + volunteer_refreshed.email + ')' + ' s\'est inscrit à votre activité ' + newActivity.intitule + ' de l\'évènement ' + newActivity.event_intitule + ' !', 'Contactez le au plus vite au ' + volunteer_refreshed.phone + ' ou par courriel à ' + volunteer_refreshed.email, 'Attention, sans nouvelles rapidement de votre part, ' + volunteer_refreshed.firstname + ' ne peut pas être sûr que l\'évènement aura bien lieu !']
                        };
                        if (req.session.volunteer.admin.school_id && req.session.volunteer.admin.school_name) {
                          org_content.customMessage = [req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname + ', élève à ' + req.session.volunteer.admin.school_name + ', s\'est inscrit à votre activité ' + newActivity.intitule + ' de l\'évènement ' + newActivity.event_intitule + ' !', 'Ceci est dans le cadre du programme de bénévolat de son l\'école', 'Contactez le au plus vite au ' + volunteer_refreshed.phone + ' ou par courriel à ' + volunteer_refreshed.email, 'Attention, sans nouvelles rapidement de votre part, ' + volunteer_refreshed.firstname + ' ne peut pas être sûr que l\'évènement aura bien lieu !']
                          console.log('Alert organism that the volunteer who just subscribed is a student ! ' + JSON.stringify(org_content.customMessage));
                        };
                        emailer.sendSubscriptionOrgEmail(org_content);
                        var vol_content = {
                          recipient: volunteer_refreshed.email,
                          firstname: volunteer_refreshed.firstname,
                          customMessage: ['Tu es inscrit le ' + dayString + ' à : ' + newActivity.address, 'Avant de t\'y rendre, prend bien contact avec ' + organism.firstname + ' ' + organism.lastname + ' au ' + organism.phone + ' ou par courriel avec ' + organism.email + ' pour parler des détails de l\'activité !'],
                        };
                        emailer.sendSubscriptionVolEmail(vol_content);
                        //Intercom create addlongterm event
                        client.events.create({
                          event_name: 'vol_event_subscribe',
                          created_at: Math.round(Date.now() / 1000),
                          user_id: req.session.volunteer._id,
                          metadata: {
                            act_id: req.params.act_id
                          }
                        });
                        update_intercom.update_subscriptions(req.session.volunteer, req.session.volunteer.events, 'EV', function(err) {
                          if (err) {
                            err.type = 'MINOR';
                            err.print = 'Mise à jour des inscriptions Intercom : problème ';
                            next(err);
                          } else {
                            console.log('Intercom subscriptions updated for volunteer : ' + req.session.volunteer.email);
                          };
                        });
                      });
                    });
                  }
                });
              }
            })
          } else {
            let err = {};
            err.type = 'CRASH'
            err.print = 'Inscription annulée : problème dans la base de donnée';
            next(err);
          }
        }
      });
    } else {
      console.log('Already subscribed to this event');
      var error = encodeURIComponent('Vous êtes déjà inscrit à cette activité !');
      res.redirect('/volunteer/map?error=' + error);
      res.end();
    }
  };
  if (req.session.volunteer.admin && req.session.volunteer.admin.school_id) {
    schools_res.getQuestions(req.session.volunteer.admin, function(questions) {
      subscribeToActivity(questions.student_questions, questions.organism_questions);
    });
  } else {
    subscribeToActivity(null, null);
  }
});

router.post('/volunteer/longterm/subscribe/:lt_id', permissions.requireGroup('volunteer'), function(req, res, next) {
  console.log('lt_id : ' + req.params.lt_id + typeof req.params.lt_id);
  req.session.longterm_interaction = true;


  function isLongterm(lt) {
    return (lt._id.toString() === req.params.lt_id.toString());
  };
  var alreadyExists = req.session.volunteer.long_terms.find(isLongterm);
  console.log('alreadyExists : ' + alreadyExists + typeof alreadyExists);
  if (typeof alreadyExists === 'undefined') {
    let phone = {};
    if (req.session.volunteer.phone) {
      phone = req.session.volunteer.phone;
    } else if (req.body.phone) {
      phone = req.body.phone;
    } else {
      phone = null;
    };
    console.log('phone : ' + phone);

    ltSubs.subscribe(req.session.volunteer, req.params.lt_id, req.headers.host, phone, function(err, results) {
      if (err) {
        err.type = 'CRASH';
        err.print = 'Inscription annulée : problème dans la base de donnée';
        next(err);
      } else {
        game.refreshPreferences(results.newVolunteer, function(err, volunteer_refreshed) {
          if (err) {
            err.type = 'MINOR';
            err.print = 'Problème de mise à jour des préférences du bénévole dans la base de données';
            next(err);
          } else {
            req.session.volunteer = volunteer_refreshed;
            req.session.save(function() {
              console.log('newltreq.session.volunteer.long_terms : ' + req.session.volunteer.long_terms);
              var newlt = req.session.volunteer.long_terms.find(function(lt) {
                console.log('lt._id: ' + lt._id + 'req.params.lt_id :' + req.params.lt_id);
                console.log((lt._id.toString() === req.params.lt_id.toString()));
                return ((lt._id).toString() === (req.params.lt_id).toString());
              });
              console.log('newlt : ' + newlt);
              //Intercom create subscribe to longterm event
              client.events.create({
                event_name: 'vol_longterm_subscribe',
                created_at: Math.round(Date.now() / 1000),
                user_id: req.session.volunteer._id,
                metadata: {
                  lt_id: req.params.lt_id,
                  lt_intitule: newlt.intitule
                }
              });
              update_intercom.update_subscriptions(req.session.volunteer, req.session.volunteer.long_terms, 'LT', function(err) {
                if (err) {
                  err.type = 'MINOR';
                  next(err);
                } else {
                  console.log('Intercom subscriptions updated for volunteer : ' + req.session.volunteer.email);
                };
              });
              res.render('v_postsubscription.jade', {
                link_to_share: '/longterm/' + req.params.lt_id,
                org_phone: results.newOrganism.phone,
                session: req.session,
                org_name: results.newOrganism.org_name,
                email: results.newOrganism.email,
                volunteer: req.session.volunteer,
                group: req.session.group
              });
            });
          }
        })
      }
    });
  } else {
    console.log('Already subscribed to this long_term');
    var error = encodeURIComponent('Vous êtes déjà inscrit à cet engagement !');
    res.redirect('/volunteer/map?error=' + error);
    res.end();
  }
});

router.get('/user', function(req, res) {
  res.json(req.session.volunteer);
});

router.get('/volunteer/student_questions/:act_id-:act_day', permissions.requireGroup('volunteer'), function(req, res) {

  function alreadyAnswered(event) {
    if (event.activity_id.toString() == req.params.act_id.toString()) {
      if (event.student_answers.length) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  };

  function goodEvent(event) {
    return ((event.activity_id.toString() == req.params.act_id.toString()) && (event.day == req.params.act_day));
  };

  var event_answered = req.session.volunteer.events.filter(alreadyAnswered);
  console.log('event_answered.length = ' + event_answered.length);
  var event = req.session.volunteer.events.find(goodEvent);
  if (event_answered.length > 0 || (event.student_questions.length < 1)) {
    res.redirect('/volunteer/profile');
  } else {
    Activity.findById(req.params.act_id, function(err, activity) {
      res.render('v_questions.jade', {
        session: req.session,
        volunteer: req.session.volunteer,
        act_id: req.params.act_id,
        act_day: req.params.act_day,
        org_name: activity.org_name,
        event_intitule: activity.event_intitule,
        activity_intitule: activity.intitule,
        description: event.description_event,
        questions: event.student_questions,
        group: req.session.group
      });
    });
  };
});

router.get('/volunteer/student_questions/:lt_id', permissions.requireGroup('volunteer'), function(req, res) {

  function alreadyAnswered(lt) {
    if (lt._id.toString() == req.params.lt_id.toString()) {
      if (lt.student_answers.length) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  };

  function goodLongterm(lt) {
    return (lt._id.toString() == req.params.lt_id.toString());
  };
  var lt_answered = req.session.volunteer.long_terms.filter(alreadyAnswered);
  var longterm = req.session.volunteer.long_terms.find(goodLongterm);
  console.log('lt_answered = ' + JSON.stringify(lt_answered));
  console.log('lt_answered.length = ' + lt_answered.length);
  if (lt_answered.length > 0 || (longterm.student_questions.length < 1)) {
    res.redirect('/volunteer/profile');
  } else {
    res.render('v_questions.jade', {
      session: req.session,
      volunteer: req.session.volunteer,
      longterm: longterm,
      org_name: longterm.org_name,
      questions: longterm.student_questions,
      group: req.session.group
    });
  };
});

router.get('/volunteer/sharewithfriends', permissions.requireGroup('volunteer'), function(req, res) {
  if (req.query.link) {
    let type = req.query.link.charAt(1) == 'a' ? 'activity' : 'other';
    console.log('type : ' + type + ' because req.query.link.charAt(1) = ' + req.query.link.charAt(1));
    res.render('v_sharewithfriends.jade', {
      volunteer: req.session.volunteer,
      session: req.session,
      link: req.query.link,
      group: req.session.group,
      type
    });
  } else {
    res.redirect('/volunteer/profile');
  }
});

router.get('/volunteer/contact_warning', permissions.requireGroup('volunteer'), function(req, res) {
  res.render('v_contact_warning.jade', {
    volunteer: req.session.volunteer,
    session: req.session,
    group: req.session.group
  });
});

router.post('/volunteer/student_questions', permissions.requireGroup('volunteer'), function(req, res, next) {
  function isAKeyAnswer(key) {
    return key.search('answer') != -1;
  };
  const student_answers_keys = Object.keys(req.body).filter(isAKeyAnswer);
  var student_answers = [];
  for (var key_i = student_answers_keys.length - 1; key_i >= 0; key_i--) {
    student_answers.push(req.body[student_answers_keys[student_answers_keys.length - 1 - key_i]]);
  };
  console.log('student_answers : ' + student_answers);
  console.log('JSON.stringify(req.body) : ' + JSON.stringify(req.body));
  if (typeof req.body.act_id !== 'undefined') {
    console.log('We define query and update for an activity !');
    var query = {
      '_id': req.session.volunteer._id,
      'events': {
        '$elemMatch': {
          'activity_id': req.body.act_id,
          'day': req.body.act_day
        }
      }
    };
    var update = {
      '$set': {
        'events.$.student_answers': student_answers
      }
    };
  } else if (typeof req.body.lt_id !== 'undefined') {
    console.log('We define query and update for a lt !');
    var query = {
      '_id': req.session.volunteer._id,
      'long_terms': {
        '$elemMatch': {
          '_id': req.body.lt_id
        }
      }
    };
    var update = {
      '$set': {
        'long_terms.$.student_answers': student_answers
      }
    };
  };
  console.log('update : ' + JSON.stringify(update));
  console.log('query : ' + JSON.stringify(query));
  Volunteer.findOneAndUpdate(query, update, {
    returnNewDocument: true,
    new: true
  }, function(err, newVolunteer) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème lors de l\'enregistrement des réponses aux questions';
      next(err);
    } else {
      req.session.volunteer = newVolunteer;
      req.session.save(function() {
        console.log('newVolunteer : ' + newVolunteer);
        console.log('newVolunteer === req.session.volunteer : ' + (req.session.volunteer === newVolunteer));
        const message = encodeURIComponent('Tes réponses ont bien été prises en compte');
        res.redirect('/volunteer/profile?success=' + message);
        let email_content = {
          recipient: newVolunteer.email,
          customMessage: [newVolunteer.firstname + ', tes retours sur ton bénévolat ont bien été pris en compte et sont désormais visible par la personne responsable du bénévolat dans ton école.', 'Néanmoins, en revenant sur la plateforme, tu peux quand même les modifier s\'ils ne te satisfont pas ! :)'],
        };
        emailer.sendStudentQuestionsEmail(email_content);
      })
    }
  });
});


function getAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

///////////////////////////////////////-----------------AGENDAS------------------
function sendEmailOneDayBeforeEvent(event_date, volunteer, activity, start_time, end_time) {

  //Transform date
  console.log('event_date at the beginnning' + event_date);
  console.log('event_date at the beginnning with new Date()' + new Date(event_date));
  let start_date = (new Date(event_date)).getTime();
  let s_time = {};
  let e_time = {};
  let is_time_precised = true;
  start_date = moment(start_date).add(5, 'hours');

  if (start_time) {
    s_time = moment(start_time, 'H:mm a');
  } else {
    s_time = moment('2:00 pm', 'H:mm a');
    is_time_precised = false;
  };


  if (end_time) {
    e_time = moment(end_time, 'H:mm a');
  } else {
    is_time_precised = false;
    e_time = moment('3:00 pm', 'H:mm a');
  }

  let end_date = {};
  start_date = moment(start_date).hour(s_time.hour()).minute(s_time.minute());
  end_date = moment(start_date).hour(e_time.hour()).minute(e_time.minute());
  const dayBefore = moment(start_date).subtract(1, 'days');
  const fiveDaysBefore = moment(start_date).subtract(7, 'days');
  const dayAfter = moment(end_date).add(20, 'hours');
  console.info('start_date : ' + moment(start_date).format('dddd D MMMM YYYY HH:mm'));
  console.info('end_date : ' + moment(end_date).format('dddd D MMMM YYYY HH:mm'));
  console.info('dayAfter : ' + moment(dayAfter).format('dddd D MMMM YYYY HH:mm'));
  console.info('dayAfter : ' + moment(dayAfter).toString());
  console.info('dayAfter : ' + moment(dayAfter).toISOString());
  console.info('dayBefore : ' + moment(dayBefore).format('dddd D MMMM YYYY HH:mm'));
  console.info('dayBefore : ' + moment(dayBefore).toString());
  console.info('dayBefore : ' + moment(dayBefore).toISOString());
  let start_date_to_send = {};
  if (is_time_precised) {
    start_date_to_send = moment(start_date).format('dddd D MMMM HH:mm');
  } else {
    start_date_to_send = moment(start_date).format('dddd D MMMM');
  }

  agenda.schedule(moment(dayBefore).toDate(), 'sendDayBeforeEmail', {
    event_date,
    activity_id: (activity._id).toString(),
    firstname: volunteer.firstname,
    lastname: volunteer.lastname,
    org_name: activity.org_name,
    address: activity.address,
    start_date: start_date_to_send,
    email: volunteer.email
  });

  agenda.schedule(moment(fiveDaysBefore).toDate(), 'sendOneWeekBeforeEmail', {
    event_date,
    activity_id: (activity._id).toString(),
    firstname: volunteer.firstname,
    lastname: volunteer.lastname,
    org_name: activity.org_name,
    address: activity.address,
    start_date: start_date_to_send,
    event_intitule: activity.event_intitule,
    email: volunteer.email,
    phone: volunteer.phone
  });

  agenda.schedule(moment(dayAfter).toDate(), 'sendDayAfterEmail', {
    event_date,
    activity_id: (activity._id).toString(),
    firstname: volunteer.firstname,
    lastname: volunteer.lastname,
    org_name: activity.org_name,
    email: volunteer.email
  });
}

module.exports = router;