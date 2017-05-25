'use strict';
var express = require('express');
var router = express.Router();
var emailer = require('../email/emailer.js');
var Intercom = require('intercom-client');
var randomstring = require('randomstring');
var school_list = require('../lib/ressources/school_list.js');
var client = new Intercom.Client({
  token: process.env.INTERCOM_TOKEN
});
var update_intercom = require('../lib/intercom/update_intercom.js');

var moment = require('moment');

var permissions = require('../middlewares/permissions.js');
var Volunteer = require('../models/volunteer_model.js');
var Organism = require('../models/organism_model.js');
var Activity = require('../models/activity_model.js');
var OrgTodo = require('../models/o_todo_model.js');
const schools_res = require('../res/schools_res.js');
var agenda = require('../lib/agenda.js');
var game = require('../lib/badges.js');
const floatToHours = require('../public/javascripts/dates/floatToHours.js').floatToHours;
const getClientSchools = require('../lib/ressources/client_school_list.js').getClientSchools;



router.get('/volunteer/profile', permissions.requireGroup('volunteer'), function(req, res, next) {
  console.log('Begin get /profile')
  var events_past = [];
  var events_pending = [];
  var events_subscribed = [];
  var events_denied = [];
  var events_confirmed = [];
  var events_refused = [];
  var error;
  const volunteer = req.session.volunteer;
  for (var eventI = req.session.volunteer.events.length - 1; eventI >= 0; eventI--) {
    if (Date.parse(volunteer.events[eventI].day) < Date.now() && volunteer.events[eventI].status === 'subscribed') {
      events_past.push(volunteer.events[eventI]);
    } else if (Date.parse(volunteer.events[eventI].day) > Date.now()) {
      volunteer.events[eventI].status = 'subscribed';
      events_subscribed.push(volunteer.events[eventI]);
    } else if (Date.parse(volunteer.events[eventI].day) < Date.now() && volunteer.events[eventI].status === 'pending') {
      events_pending.push(volunteer.events[eventI]);
    } else if ((Date.parse(volunteer.events[eventI].day) < Date.now() && volunteer.events[eventI].status === 'confirmed') || volunteer.events[eventI].status == 'absent' || volunteer.events[eventI].status == 'corrected' || volunteer.events[eventI].status == 'validated') {
      events_confirmed.push(volunteer.events[eventI]);
    } else if (volunteer.events[eventI].status == 'denied') {
      events_denied.push(volunteer.events[eventI]);
    } else if (volunteer.events[eventI].status == 'refused') {
      events_refused.push(volunteer.events[eventI]);
    } else {
      error = 'Une erreur avec vos inscriptions';
      console.log(error);
    }
  };
  const lt_nb = volunteer.long_terms.length;
  var lt_hours_done = 0;
  volunteer.long_terms.reduce(function(pre, cur, ind, arr) {
    if (arr[ind].hours_done) {
      lt_hours_done = lt_hours_done + arr[ind].hours_done;
      console.log('lt_hours_done :  ' + lt_hours_done);
    }
    return pre;
  }, lt_hours_done);


  const events_hours_done = volunteer.events.reduce(function(pre, cur, ind, arr) {
    if ((['absent', 'subscribed', 'past'].indexOf(cur.status) == -1) && cur.hours_done) {
      console.log('pre + arr[ind].hours_done : ' + (pre + cur.hours_done));
      return pre + cur.hours_done;
    } else {
      return pre;
    }
  }, 0);

  const extras_hours_done = volunteer.extras.reduce(function(pre, cur, ind, arr) {
    if (arr[ind].hours_done) {
      console.log('pre + arr[ind].hours_done : ' + (pre + arr[ind].hours_done));
      return pre + arr[ind].hours_done;
    } else {
      return pre;
    }
  }, 0);

  const manuals_hours_done = volunteer.manuals.reduce(function(pre, cur, ind, arr) {
    if (arr[ind].hours_done) {
      console.log('pre + arr[ind].hours_done : ' + (pre + arr[ind].hours_done));
      return pre + arr[ind].hours_done;
    } else {
      return pre;
    }
  }, 0);


  //FIND A LONGTERM WHICH NEED ACTION
  let longterm_waiting = null;
  if (req.session.longterm_interaction) {
    console.info('INFO : req.session.longterm_interaction is already TRUE');
  } else {
    longterm_waiting = volunteer.long_terms.find(function(lt) {
      console.info('moment(lt.last_interaction).add(1, onths) : ' + moment(lt.last_interaction).add(1, 'months'));
      console.info('moment() : ' + moment());
      console.info('(moment(lt.last_interaction).add(1, "months")) < moment() : ' + ((moment(lt.last_interaction).add(1, 'months')) < moment()));
      return (lt.status != 'pending' && (!(lt.last_interaction) || ((moment(lt.last_interaction).add(1, 'months')) < moment())));
    })
  }
  console.info('longterm_waiting : ' + longterm_waiting);


  console.log('events_confirmed.length :  ' + events_confirmed.length);
  console.log('extras_hours_done :  ' + extras_hours_done);
  console.log('manuals_hours_done :  ' + manuals_hours_done);
  console.log('lt_hours_done :  ' + lt_hours_done);
  //Get schools_list
  school_list.getSchoolList('./res/schools_list.csv', function(err, schools_list) {
    if (err) {
      let error = {};
      error.print = err;
      error.type = 'MINOR';
      next(err);
    };
    const hash = require('intercom-client').SecureMode.userHash({
      secretKey: process.env.INTERCOM_SECRET_KEY,
      identifier: req.session.volunteer.email
    });
    getClientSchools(function(err, client_schools) {
      if (err) {
        let error = {};
        error.print = err;
        error.type = 'MINOR';
        next(err);
      }
      //Sort extras by status
      req.session.volunteer.extras.sort((a, b) => {
        if ((a.status == 'denied') && (b.status != 'denied')) {
          return -1;
        } else if ((a.status != 'denied') && (b.status == 'denied')) {
          return 1;
        } else {
          if ((a.status == 'pending') && (b.status != 'pending')) {
            return -1;
          } else if ((a.status != 'pending') && (b.status == 'pending')) {
            return 1;
          } else {
            if ((a.status == 'corrected') && (b.status != 'corrected')) {
              return -1;
            } else if ((a.status != 'corrected') && (b.status == 'corrected')) {
              return 1;
            } else {
              if ((a.status == 'validated') && (b.status != 'validated')) {
                return -1;
              } else if ((a.status != 'validated') && (b.status == 'validated')) {
                return 1;
              } else {
                if ((a.status == 'confirmed') && (b.status != 'confirmed')) {
                  return -1;
                } else if ((a.status != 'confirmed') && (b.status == 'confirmed')) {
                  return 1;
                } else {
                  if ((a.status == 'refused') && (b.status != 'refused')) {
                    return -1;
                  } else if ((a.status != 'refused') && (b.status == 'refused')) {
                    return 1;
                  } else {
                    return 0;
                  }
                }
              }
            }
          }
        }
      });

      let game_results = game.getBadges(req.session.volunteer, lt_hours_done, events_hours_done, function(err, game_results) {
        if (err) {
          let error = {};
          error.print = 'Problème d\'obtention des badges du profil';
          error.type = 'MINOR';
          next(err);
        }
        const badges = game_results.badges;
        const scores = game_results.scores;

        function getSum(total, num) {
          return total + num;
        }
        const bonus = game_results.bonus.reduce(getSum);
        const score = bonus + scores.reduce(getSum);

        res.render('v_profile.jade', {
          session: req.session,
          volunteer: req.session.volunteer,
          group: req.session.group,
          error,
          err,
          badges,
          bonus,
          scores,
          score,
          schools_list,
          events_subscribed,
          events_refused,
          events_confirmed,
          events_pending,
          events_past,
          events_hours_done,
          lt_hours_done,
          manuals_hours_done,
          extras_hours_done,
          hash,
          client_schools,
          events_denied,
          floatToHours,
          longterm_waiting
        });
      });
    });
  });
});

//Unsubscribe from an event
router.post('/volunteer/unsubscribe/:act_id-:day', permissions.requireGroup('volunteer'), function(req, res, next) {
  const activity_id = req.params.act_id,
    day = req.params.day;
  console.log('Unsubscribe process starts');
  Activity.findOneAndUpdate({
    "$and": [{
      "_id": activity_id
    }, {
      "days": {
        "$elemMatch": {
          "day": req.params.day
        }
      }
    }]
  }, {
    "$pull": {
      "days.$.applicants": req.session.volunteer._id
    }
  }, {
    returnNewDocument: true
  }, function(err, newActivity) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème de recherche du bénévolat dans la base de données';
      next(err);
    } else {
      console.log('newActivity after unsubscription process : ' + newActivity);
      Volunteer.findOneAndUpdate({
        "_id": req.session.volunteer._id
      }, {
        "$pull": {
          "events": {
            "activity_id": req.params.act_id,
            "day": req.params.day
          }
        }
      }, {
        returnNewDocument: true,
        multi: true,
        new: true
      }, function(err, newVolunteer) {
        if (err) {
          err.type = 'CRASH';
          err.print = 'Problème de mise à jour du bénévolat dans la base de données';
          next(err);
        } else {
          function isNotActivity(activity) {
            return activity.activity_id != req.params.activity_id;
          };
          game.refreshPreferences(newVolunteer, function(err, volunteer_refreshed) {
            if (err) {
              err.type = 'MINOR';
              err.print = 'Problème de mise à jour des préférences du bénévole dans la base de données';
              next(err);
            } else {
              req.session.volunteer = volunteer_refreshed;
              req.session.save(function() {
                var content = {
                  recipient: newActivity.email,
                  activity_name: newActivity.intitule,
                  name: newActivity.org_name,
                  customMessage: req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname + ' s\'est désinscrit de votre activité ' + newActivity.intitule + ' de l\'évènement ' + newActivity.event_intitule + ' !'
                };
                emailer.sendUnsubscriptionEmail(content);
                //Intercom create unsubscribe to longterm event
                client.events.create({
                  event_name: 'vol_activity_unsubscribe',
                  created_at: Math.round(Date.now() / 1000),
                  user_id: req.session.volunteer._id,
                  metadata: {
                    act_id: req.params.act_id,
                    org_name: newActivity.org_name
                  }
                });
                client.users.update({
                  user_id: req.session.volunteer._id,
                  update_last_request_at: true
                });
                const dayString = new Date(req.params.day).toLocaleDateString();
                console.log('after event unsubscription process');
                res.render('v_postunsubscription.jade', {
                  session: req.session,
                  org_name: newActivity.org_name,
                  org_phone: newActivity.org_phone,
                  day: dayString,
                  volunteer: req.session.volunteer,
                  group: req.session.group
                });
                agenda.cancel({
                  'data.event_date': (new Date(req.params.day)).toString(),
                  'data.activity_id': (req.params.act_id).toString()
                }, function(err, numRemoved) {
                  if (err) {
                    console.error('ERROR : in unsubscribe and err ' + err);
                  } else {
                    console.info('INFO : in unsubscribe and number agenda canceled ' + numRemoved);
                  }
                });
              });
            }
          });
        }
      })
    }
  });
});

//Unsubscribe from an event
router.post('/volunteer/unsubscribe/longterm/:lt_id', permissions.requireGroup('volunteer'), function(req, res, next) {
  const lt_id = req.params.lt_id;
  console.log('Unsubscribe process starts');
  req.session.longterm_interaction = true;
  const lt_name = (req.session.volunteer.long_terms.find(lt => {
    return lt._id == lt_id;
  })).intitule;
  Volunteer.findOneAndUpdate({
    '_id': req.session.volunteer._id
  }, {
    '$pull': {
      'long_terms': {
        '_id': lt_id
      }
    }
  }, {
    new: true
  }, function(err, new_volunteer) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème de mise à jour du bénévole dans la base de données';
      next(err);
    } else {
      game.refreshPreferences(new_volunteer, function(err, volunteer_refreshed) {
        if (err) {
          err.type = 'MINOR';
          err.print = 'Problème de mise à jour des préférences du bénévole dans la base de données';
          next(err);
        } else {
          req.session.volunteer = volunteer_refreshed;
          req.session.save(function(err) {
            if (err) {
              err.type = 'CRASH';
              err.print = 'Problème de mise à jour du bénévole dans la base de données';
              next(err);
            } else {
              Organism.findOneAndUpdate({
                'long_terms': {
                  '$elemMatch': {
                    '_id': lt_id
                  }
                }
              }, {
                '$pull': {
                  'long_terms.$.applicants': volunteer_refreshed._id
                }
              }, {
                new: true
              }, function(err, new_organism) {
                if (err) {
                  err.type = 'CRASH';
                  err.print = 'Problème de mise à jour du bénévolat dans la base de données';
                  next(err);
                } else {
                  console.log('after longterm unsubscription process');
                  res.render('v_postunsubscription.jade', {
                    session: req.session,
                    org_name: new_organism.org_name,
                    volunteer: req.session.volunteer,
                    group: req.session.group
                  });
                  update_intercom.update_subscriptions(req.session.volunteer, req.session.volunteer.long_terms, 'LT', function(err) {
                    if (err) {
                      let error = {};
                      error.print = err;
                      error.type = 'MINOR';
                      next(err);
                    } else {
                      console.log('Intercom subscriptions updated for volunteer : ' + req.session.volunteer.email);
                    };
                  });
                  const content = {
                    recipient: new_organism.email,
                    activity_name: lt_name,
                    name: new_organism.org_name,
                    customMessage: req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname + ' s\'est désinscrit de votre engagement ' + lt_name + ' !'
                  };
                  emailer.sendUnsubscriptionEmail(content);
                }
              })
            }
          })
        }
      })
    }
  });
});

//Add hours_pending to an activity
router.post('/volunteer/hours_pending/:act_id-:day', permissions.requireGroup('volunteer'), function(req, res, next) {
  console.info('DATAS : req.body : ' + JSON.stringify(req.body));
  console.info('DATAS : req.params : ' + JSON.stringify(req.params));
  if (req.body.hours_pending) {
    Volunteer.findOneAndUpdate({
      "$and": [{
        "_id": req.session.volunteer._id
      }, {
        "events": {
          '$elemMatch': {
            'activity_id': req.params.act_id,
            'day': req.params.day
          }
        }
      }]
    }, {
      "$set": {
        "events.$.hours_pending": req.body.hours_pending,
        "events.$.status": 'pending'
      }
    }, {
      returnNewDocument: true,
      new: true
    }, function(err, newVolunteer) {
      if (err) {
        err.type = 'CRASH';
        err.print = 'Problème de mise à jour du bénévole dans la base de données';
        next(err);
      } else {
        game.refreshPreferences(newVolunteer, function(err, volunteer_refreshed) {
          if (err) {
            err.type = 'MINOR';
            err.print = 'Problème de mise à jour des préférences du bénévole dans la base de données';
            next(err);
          } else {
            req.session.volunteer = volunteer_refreshed;
            req.session.save(function() {
              console.log('volunteer_refreshed ' + volunteer_refreshed);

              function isActivity(event) {
                console.log('isActivity : ' + (event.activity_id.toString() == req.params.act_id.toString()));
                return event.activity_id.toString() == req.params.act_id.toString();
              };

              function isDay(event) {
                return Date.parse(event.day) == Date.parse(req.params.day);
              };
              const event = volunteer_refreshed.events.filter(isActivity).find(isDay);
              if (event.organism_questions) {
                var newTodo = new OrgTodo({
                  type: 'hours_pending',
                  org_id: event.org_id,
                  lastname: volunteer_refreshed.lastname,
                  firstname: volunteer_refreshed.firstname,
                  vol_id: volunteer_refreshed._id,
                  activity_id: req.params.act_id,
                  day: Date.parse(req.params.day),
                  activity_intitule: event.intitule_activity,
                  hours: req.body.hours_pending,
                  student: true,
                  organism_questions: event.organism_questions
                });
              } else {
                var newTodo = new OrgTodo({
                  type: 'hours_pending',
                  org_id: event.org_id,
                  lastname: volunteer_refreshed.lastname,
                  firstname: volunteer_refreshed.firstname,
                  vol_id: volunteer_refreshed._id,
                  activity_id: req.params.act_id,
                  day: Date.parse(req.params.day),
                  activity_intitule: event.intitule_activity,
                  hours: req.body.hours_pending
                });
              };
              //Intercom create unsubscribe to longterm event
              client.events.create({
                event_name: 'vol_activity_hourspending',
                created_at: Math.round(Date.now() / 1000),
                user_id: req.session.volunteer._id,
                metadata: {
                  act_id: req.params.act_id,
                  intitule_activity: event.intitule_activity
                }
              });
              client.users.update({
                user_id: req.session.volunteer._id,
                update_last_request_at: true
              });
              Organism.findById(event.org_id, {
                email: true,
                org_name: true
              }, function(err, orga) {
                if (err) {
                  err.type = 'MINOR';
                  next(err);
                } else {
                  emailer.sendHoursPendingOrgEmail({
                    firstname: req.session.volunteer.firstname,
                    lastname: req.session.volunteer.lastname,
                    recipient: orga.email,
                    link: 'www.simplyk.io/organism/dashboard',
                    customMessage: [req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname + ' vient de rentrer ses ' + req.body.hours_pending + ' h  de participation à l\'évènement ' + event.intitule + '.', 'Rendez-vous sur la plateforme pour valider ou corriger ces heures de participation !', 'Ceci est très important pour le bénévole !']
                  });
                  emailer.sendHoursPendingVolEmail({
                    name: orga.org_name,
                    hours: req.body.hours_pending,
                    recipient: req.session.volunteer.email,
                    customMessage: ['Tes ' + req.body.hours_pending + ' h  de participation à l\'évènement ' + event.intitule + ' ont bien été enregistrées.', orga.org_name + ' peut maintenant valider cette participation !']
                  });
                };
              });
              //TODO creation
              newTodo.save(function(err, todo) {
                if (err) {
                  err.type = 'CRASH';
                  err.print = 'Problème de création de la notification de l\'organisme dans la base de données';
                  next(err);
                } else {
                  sendEmailIfHoursNotValidated(req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname, todo._id);
                  if (event.student_questions) {
                    res.redirect('/volunteer/student_questions/' + req.params.act_id + '-' + req.params.day);
                  } else {
                    res.redirect('/volunteer/profile');
                  }
                }
              })
            })
          }
        });
      }
    });
  } else if (req.body.absent) {
    Volunteer.findOneAndUpdate({
      "$and": [{
        "_id": req.session.volunteer._id
      }, {
        "events": {
          '$elemMatch': {
            'activity_id': req.params.act_id,
            'day': req.params.day
          }
        }
      }]
    }, {
      "$set": {
        "events.$.hours_done": 0,
        "events.$.hours_pending": 0,
        "events.$.status": 'absent'
      }
    }, {
      returnNewDocument: true,
      new: true
    }, function(err, newVolunteer) {
      if (err) {
        err.type = 'CRASH';
        err.print = 'Problème de mise à jour du bénévole dans la base de données';
        next(err);
      } else {
        game.refreshPreferences(newVolunteer, function(err, volunteer_refreshed) {
          if (err) {
            err.type = 'MINOR';
            err.print = 'Problème de mise à jour des préférences du bénévole dans la base de données';
            next(err);
          } else {
            req.session.volunteer = volunteer_refreshed;
            req.session.save(function() {
              console.log('volunteer_refreshed ' + volunteer_refreshed);
              const message = encodeURIComponent('Ton absence à l\'évènement a bien été prise en compte');
              res.redirect('/volunteer/map?success=' + message);
              //Intercom create unsubscribe to longterm event
              client.events.create({
                event_name: 'vol_activity_absence',
                created_at: Math.round(Date.now() / 1000),
                user_id: req.session.volunteer._id,
                metadata: {
                  act_id: req.params.act_id
                }
              });
              client.users.update({
                user_id: req.session.volunteer._id,
                update_last_request_at: true
              });
            });
          };
        })
      }
    });
  } else {
    const err = 'ERROR: It seems you didn\'t have complete the hours_done field';
    console.log(err);
    console.log('req.body : ' + JSON.stringify(req.body));
    res.redirect('/volunteer/map?error=' + err);
  }
});


//Add hours_pending to an activity
router.post('/volunteer/LThours_pending/:lt_id', permissions.requireGroup('volunteer'), function(req, res, next) {
  console.log('JSON.stringify(req.body) : ' + JSON.stringify(req.body));
  console.log('JSON.stringify(req.params) : ' + JSON.stringify(req.params));
  req.session.longterm_interaction = true;
  if (req.body.hours_pending) {

    function isLongTerm(longterm) {
      console.log('isLongTerm : ' + (longterm._id == req.params.lt_id));
      return (longterm._id).toString() == (req.params.lt_id).toString();
    };
    const lt = req.session.volunteer.long_terms.find(isLongTerm);
    console.log('lt : ' + JSON.stringify(lt));
    console.log('lt.hours_pending : ' + lt.hours_pending);
    if (lt.hours_pending > 0) {
      console.log('lt.hours_pending is positive');
      var new_hours_pending = parseFloat(lt.hours_pending) + parseFloat(req.body.hours_pending);
    } else {
      var new_hours_pending = parseFloat(req.body.hours_pending);
      console.log('lt.hours_pending is not positive');
    };
    console.log('new_hours_pending : ' + new_hours_pending);
    Volunteer.findOneAndUpdate({
      "$and": [{
        "_id": req.session.volunteer._id
      }, {
        "long_terms": {
          '$elemMatch': {
            '_id': req.params.lt_id
          }
        }
      }]
    }, {
      "$set": {
        "long_terms.$.hours_pending": new_hours_pending,
        "long_terms.$.status": 'pending',
        "long_terms.$.last_interaction": new Date()
      }
    }, {
      returnNewDocument: true,
      new: true
    }, function(err, newVolunteer) {
      if (err) {
        err.type = 'CRASH';
        err.print = 'Problème de mise à jour du bénévole dans la base de données';
        next(err);
      } else {
        game.refreshPreferences(newVolunteer, function(err, volunteer_refreshed) {
          if (err) {
            err.type = 'MINOR';
            err.print = 'Problème de mise à jour des préférences du bénévole dans la base de données';
            next(err);
          } else {
            req.session.volunteer = volunteer_refreshed;
            req.session.save(function() {
              const new_lt = volunteer_refreshed.long_terms.find(isLongTerm);
              console.log('(typeof new_lt.hours_done == undefined) ' + (typeof new_lt.hours_done == 'undefined'));
              console.log('(new_lt.organism_answers.length<1) ' + (new_lt.organism_answers.length < 1));
              console.log('(volunteer_refreshed.student) ' + (volunteer_refreshed.student));
              console.log('!(lt.hours_pending>0) ' + !(lt.hours_pending > 0));
              console.log(new_lt);
              if ((new_lt.organism_questions.length > 0) && (typeof new_lt.hours_done == 'undefined') && (new_lt.organism_answers.length < 1) && !(lt.hours_pending > 0)) {
                var newTodo = new OrgTodo({
                  type: 'LThours_pending',
                  org_id: new_lt.org_id,
                  lastname: volunteer_refreshed.lastname,
                  firstname: volunteer_refreshed.firstname,
                  vol_id: volunteer_refreshed._id,
                  lt_id: req.params.lt_id,
                  lt_intitule: new_lt.intitule,
                  hours: req.body.hours_pending,
                  student: true,
                  organism_questions: new_lt.organism_questions
                });
              } else {
                var newTodo = new OrgTodo({
                  type: 'LThours_pending',
                  org_id: new_lt.org_id,
                  lastname: volunteer_refreshed.lastname,
                  firstname: volunteer_refreshed.firstname,
                  vol_id: volunteer_refreshed._id,
                  lt_id: req.params.lt_id,
                  lt_intitule: new_lt.intitule,
                  hours: req.body.hours_pending
                });
              };

              //Intercom create unsubscribe to longterm event
              client.events.create({
                event_name: 'vol_longterm_hourspending',
                created_at: Math.round(Date.now() / 1000),
                user_id: req.session.volunteer._id,
                metadata: {
                  lt_id: req.params.lt_id,
                  intitule_longterm: new_lt.intitule
                }
              });
              Organism.findById(new_lt.org_id, {
                email: true
              }, function(err, orga) {
                if (err) {
                  err.type = 'MINOR';
                  err.print = 'Problème de mise à jour du bénévole dans la base de données';
                  next(err);
                } else {
                  emailer.sendHoursPendingOrgEmail({
                    firstname: req.session.volunteer.firstname,
                    lastname: req.session.volunteer.lastname,
                    recipient: orga.email,
                    link: 'www.simplyk.io/organism/dashboard',
                    customMessage: [req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname + ' vient de rentrer ses ' + req.body.hours_pending + ' h  de participation à l\'engagement ' + new_lt.intitule + '.', 'Rendez-vous sur la plateforme pour valider ou corriger ces heures de participation !', 'Ceci est très important pour le bénévole !']
                  });
                }
              });
              newTodo.save(function(err, todo) {
                if (err) {
                  err.type = 'CRASH';
                  err.print = 'Problème de création de la notification de l\'organisme dans la base de données';
                  next(err);
                } else {
                  console.log('INFO : Todo created : ' + todo);
                  if (todo.organism_questions) {
                    res.redirect('/volunteer/student_questions/' + req.params.lt_id);
                  } else {
                    res.redirect('/volunteer/profile');
                  }
                }
              })
            })
          }
        })
      }
    });
  } else {
    const err = 'ERROR: It seems you didn\'t have complete the hours_done field';
    console.error(err);
    res.redirect('/volunteer/map?error=' + err);
  }
});


router.post('/volunteer/notyet/:lt_id', permissions.requireGroup('volunteer'), function(req, res, next) {
  console.log('JSON.stringify(req.body) : ' + JSON.stringify(req.body));
  console.log('JSON.stringify(req.params) : ' + JSON.stringify(req.params));
  let date_to_report_as_last_interaction = new Date();
  if (req.body.finished) {
    date_to_report_as_last_interaction = moment(date_to_report_as_last_interaction).add(100, 'y');
  }
  console.log('Date reported as last_interaction : ' + moment(date_to_report_as_last_interaction).format());
  req.session.longterm_interaction = true;
  Volunteer.findOneAndUpdate({
    "$and": [{
      "_id": req.session.volunteer._id
    }, {
      "long_terms": {
        '$elemMatch': {
          '_id': req.params.lt_id
        }
      }
    }]
  }, {
    "$set": {
      "long_terms.$.last_interaction": date_to_report_as_last_interaction
    }
  }, {
    returnNewDocument: true,
    new: true
  }, function(err, newVolunteer) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème de mise à jour du bénévole dans la base de données';
      next(err);
    } else {
      req.session.volunteer = newVolunteer;
      req.session.save(function() {
        res.sendStatus(200).end();
      })
    }
  });
});


router.get('/volunteer/event/:event_id', permissions.requireGroup('volunteer'), function(req, res, next) {

  //Pour trouver l'event dasn le volunteer
  function isEvent(event) {
    return event._id == req.params.event_id;
  };
  const event_in_volunteer = req.session.volunteer.events.find(isEvent);
  const activity_id = event_in_volunteer.activity_id;

  Organism.findOne({
    'events.activities': activity_id
  }, function(err, organism) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème de récupération des informations nécessaires';
      next(err);
    } else {
      const org = organism;
      const event_organism = organism.events.find(ev => {
        return (ev.activities.indexOf(activity_id) > -1);
      });
      const activities_in_event_ids = event_organism.activities;
      Activity.find({
        '_id': {
          '$in': activities_in_event_ids
        }
      }, function(err, activities) {
        if (err) {
          err.type = 'CRASH';
          err.print = 'Problème de récupération des informations nécessaires';
          next(err);
        } else {
          var isActivity = function(activity) {
            return activity._id.toString() == activity_id.toString();
          };
          const activity_in_activities = activities.find(isActivity);
          console.log('activity_id : ' + JSON.stringify(activity_id));
          console.log('activity_in_activities : ' + JSON.stringify(activity_in_activities));
          var isNotActivity = function(activity) {
            return activity._id != activity_id;
          };
          const other_activities = activities.filter(isNotActivity);
          console.log('other_activities : ' + JSON.stringify(other_activities));

          let student_questions = [];
          let organism_questions = [];
          let student_answers = [];
          let organism_answers = [];

          if (event_in_volunteer.student_questions) {
            student_questions = event_in_volunteer.student_questions;
            student_answers = event_in_volunteer.student_answers;
            organism_answers = event_in_volunteer.organism_answers;
            organism_questions = event_in_volunteer.organism_questions;
          }

          console.info(JSON.stringify(event_organism));


          res.render('v_event.jade', {
            session: req.session,
            other_activities: other_activities,
            event: event_organism,
            organism: org,
            activity: activity_in_activities,
            event_id: event_in_volunteer._id,
            status: event_in_volunteer.status,
            volunteer: req.session.volunteer,
            group: req.session.group,
            student_answers,
            student_questions,
            organism_questions,
            organism_answers
          });
        };
      })
    };
  });
});

router.get('/volunteer/extra_simplyk_hours', permissions.requireGroup('volunteer'), function(req, res) {
  if (req.session.volunteer.admin && req.session.volunteer.admin.school_id) {
    const hash = require('intercom-client').SecureMode.userHash({
      secretKey: process.env.INTERCOM_SECRET_KEY,
      identifier: req.session.volunteer.email
    });
    //Get school questions
    schools_res.getQuestions(req.session.volunteer.admin, function(questions) {
      res.status(200).render('v_extra_simplyk_hours.jade', {
        session: req.session,
        volunteer: req.session.volunteer,
        group: req.session.group,
        student_questions: questions.student_questions,
        hash
      });
    });
  } else {
    const err = 'ERROR: Il te faut être un élève pour accéder à cette page d\'ajout d\'heures extra-Simplyk';
    console.error(err);
    res.redirect('/volunteer/map?error=' + err);
  }
});

router.post('/volunteer/addextrahours', permissions.requireGroup('volunteer'), function(req, res, next) {
  console.info('DATAS : req.body : ' + JSON.stringify(req.body));
  if (req.session.volunteer.student) {

    function isAKeyAnswer(key) {
      return key.search('answer') != -1;
    };

    const student_answers_keys = Object.keys(req.body).filter(isAKeyAnswer);
    let student_answers = [];

    for (var key_i = student_answers_keys.length - 1; key_i >= 0; key_i--) {
      student_answers.push(req.body[student_answers_keys[student_answers_keys.length - 1 - key_i]]);
    };

    console.log('student_answers : ' + student_answers);

    function addOrganismIfDoesntExist(questions) {
      //Ajouter organism s'il n'existe pas
      Organism.findOne({
        'email': req.body.org_email.toLowerCase()
      }, function(err, theOrg) {
        if (err) {
          err.type = 'CRASH';
          err.print = 'Problème lors de la recherche de l\'organisme rensigné';
          next(err);
        } else {
          //If the organism already has an account, add it a orgTodo and send it an email

          let newActivity = new Activity({
            intitule: req.body.intitule,
            extra: true,
            description: req.body.description,
            days: [{
              day: req.body.activity_date,
              applicants: [req.session.volunteer._id]
            }]
          });

          let newTodo = new OrgTodo({
            type: 'students_hours_pending',
            lastname: req.session.volunteer.lastname,
            firstname: req.session.volunteer.firstname,
            vol_id: req.session.volunteer._id,
            activity_intitule: req.body.intitule,
            day: req.body.activity_date,
            hours: req.body.hours_pending,
            student: true,
            organism_questions: questions.organism_questions,
            activity_id: newActivity._id
          });

          const setTodoAndActivityValuesFromOrganismResults = new Promise((resolve, reject) => {

            if (theOrg) {
              //if the organism has already subscribed
              newTodo.org_id = newActivity.org_id = theOrg._id;
              newActivity.org_name = theOrg.org_name;
              newActivity.email = theOrg.email;
              newActivity.org_phone = theOrg.phone;
              //if the organism exists but not email_verified
              let email_verified = theOrg.email_verified;
              let verifyUrl = '';
              if (theOrg.email_verify_string && !email_verified) {
                verifyUrl = '?verify=http://' + req.headers.host + '/verifyO/' + theOrg.email_verify_string;
              }

              emailer.sendHoursPendingOrgEmail({
                firstname: req.session.volunteer.firstname,
                lastname: req.session.volunteer.lastname,
                recipient: req.body.org_email.toLowerCase(),
                link: 'http://' + req.headers.host + '/organism/validate_extra/' + newTodo._id + verifyUrl,
                customMessage: [req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname + ' vient d\'ajouter ' + req.body.hours_pending + ' h  de participation dans votre organisme.', 'Pour valider ou corriger ses heures, cliquez sur le bouton ci-dessous ou utilisez ce lien : ' + 'http://' + req.headers.host + '/organism/validate_extra/' + newTodo._id + verifyUrl, 'L\'élève est accessible par téléphone au : ' + req.session.volunteer.phone, 'Ceci est très important pour le bénévole !']
              });

              emailer.sendHoursPendingVolEmail({
                name: theOrg.org_name,
                hours: req.body.hours_pending,
                recipient: req.session.volunteer.email,
                customMessage: ['Tes ' + req.body.hours_pending + ' h  de participation à ' + req.body.intitule + ' ont bien été prises en compte.', theOrg.org_name + ' peut maintenant valider cette participation !', 'Si tes heures ne sont pas validées bientôt par l\'organisme, n\'hésite pas à le relancer sinon ce bénévolat ne sera jamais pris en compte :)']
              });

              console.info('INFO: student add extra hours to an organism which ALREADY exists : ' + req.body.org_name);
              resolve();
            } else {
              //The organism hasn't any account on the platform, send it an email, create an account and add an orgTodo
              let pass1 = req.session.volunteer._id,
                pass2 = req.body.org_name;
              const randomString = randomstring.generate();

              let organism = new Organism({
                email: req.body.org_email.toLowerCase(),
                org_name: req.body.org_name,
                email_verified: false,
                email_verify_string: randomString,
                password: '',
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phone: req.body.org_phone,
                description: req.body.description,
                cause: 'Solidarité',
                automatic: true,
                validation: false
              });

              const passToChange = (pass1.substring(0, 3) + pass2.substring(0, 3)).toLowerCase();
              organism.password = organism.generateHash(passToChange);

              organism.save(function(err, org_saved) {
                if (err) {
                  console.error(err);
                  reject(err);
                } else {
                  if (org_saved) {
                    var hostname = req.headers.host;
                    var verifyUrl = 'http://' + hostname + '/verifyO/' + randomString;
                    console.log('Verify url sent: ' + verifyUrl);

                    newTodo.org_id = newActivity.org_id = org_saved._id;
                    newActivity.org_name = org_saved.org_name;
                    newActivity.email = org_saved.email;
                    newActivity.org_phone = org_saved.phone;


                    emailer.sendAutomaticSubscriptionOrgEmail({
                      recipient: org_saved.email,
                      button: {
                        link: 'http://' + hostname + '/organism/validate_extra/' + newTodo._id + '?verify=' + verifyUrl
                      },
                      customMessage: [req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname + ' est élève à l\'établissement ' + req.session.volunteer.admin.school_name + '.', 'Vous recevez ce message car cet élève mentionne avoir fait ' + req.body.hours_pending + 'h de bénévolat dans votre organisme.', 'Pour valider ou corriger ses heures utiles dans sa scolarité, cliquez sur le bouton ci-dessous ou utilisez ce lien : ' + 'http://' + hostname + '/organism/validate_extra/' + newTodo._id + '?verify=' + verifyUrl, 'L\'élève est accessible par téléphone au : ' + req.session.volunteer.phone],
                      after_button: ['Si vous voulez ensuite vous connecter à Simplyk, vos identifiants de connexion sont les suivants :', 'Email: ' + org_saved.email, 'Mot de passe: ' + passToChange],
                      firstname: req.session.volunteer.firstname,
                      lastname: req.session.volunteer.lastname
                    });

                    emailer.sendHoursPendingVolEmail({
                      name: org_saved.org_name,
                      hours: req.body.hours_pending,
                      recipient: req.session.volunteer.email,
                      customMessage: ['Tes ' + req.body.hours_pending + ' h  de participation à ' + req.body.intitule + ' ont bien été prises en compte.', 'Il semblerait, avec les informations que tu as fournis, que ' + org_saved.org_name + ' n\'était pas encore inscrit sur Simplyk. On lui a tout de même envoyé un courriel pour qu\'il puisse valider tes heures.', 'Si tes heures ne sont pas validées bientôt par l\'organisme, n\'hésite pas à le relancer pour que ton bénévolat soit pris en compte sur ton profil :)']
                    });
                    console.info('INFO: student add extra hours to an organism which has NOT subscribed to the platform : ' + org_saved.org_name);
                    resolve();
                  } else {
                    let err = {};
                    reject(err);
                  }
                }
              });

            }

          });

          setTodoAndActivityValuesFromOrganismResults.then(function() {

              newTodo.save(function(err, newTodo_saved) {
                if (err) {
                  err.type = 'CASH';
                  err.print = "Problème d'enregistrement de la participation";
                  next(err);
                } else {
                  if (newTodo_saved) {
                    newActivity.save(function(err, activity_saved) {
                      if (err) {
                        err.type = 'CRASH';
                        err.print = "Problème d'enregistrement de la participation";
                        next(err);
                      } else {
                        if (activity_saved) {
                          let extra_to_add = {
                            activity_id: activity_saved._id,
                            status: 'pending',
                            email: activity_saved.email,
                            org_name: activity_saved.org_name,
                            org_phone: activity_saved.org_phone,
                            intitule: activity_saved.intitule,
                            description: activity_saved.description,
                            status: 'pending',
                            days: activity_saved.days,
                            hours_pending: req.body.hours_pending,
                            extra: true,
                            student_questions: questions.student_questions,
                            organism_questions: questions.organism_questions,
                            student_answers
                          };
                          console.log('extra_to_add : ' + JSON.stringify(extra_to_add));
                          Volunteer.findOneAndUpdate({
                            '_id': req.session.volunteer._id
                          }, {
                            '$push': {
                              'extras': extra_to_add
                            }
                          }, {
                            new: true
                          }, function(err, newVolunteer) {
                            if (err) {
                              err.type = 'CRASH';
                              err.print = 'Problème lors de la mise à jour des informations du bénévole';
                              next(err);
                            } else {
                              req.session.volunteer = newVolunteer;
                              sendEmailIfHoursNotValidated(req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname, newTodo._id);
                              req.session.save(function() {
                                res.render('v_postsubscription.jade', {
                                  session: req.session,
                                  org_name: activity_saved.org_name,
                                  volunteer: req.session.volunteer,
                                  group: req.session.group,
                                  type: 'extra'
                                });
                              });

                              //Intercom create vol_add_extra
                              client.events.create({
                                event_name: 'vol_add_extra',
                                created_at: Math.round(Date.now() / 1000),
                                user_id: req.session.volunteer._id,
                                metadata: {
                                  act_id: activity_saved._id,
                                  intitule_activity: activity_saved.intitule,
                                  org_name: activity_saved.org_name
                                }
                              });
                            }
                          })
                        } else {
                          err.type = 'CRASH';
                          err.print = "Problème d'enregistrement de la participation";
                          next(err);
                        }
                      }
                    });
                  } else {
                    err.type = 'CRASH';
                    err.print = "Problème d'enregistrement de la participation";
                    next(err);
                  }
                }
              });
            })
            .catch(err => {
              err.type = 'CRASH';
              err.print = 'Problème lors de la mise à jour des informations dans la base de données';
              next(err);
            });
        }
      });
    };

    schools_res.getQuestions(req.session.volunteer.admin, function(questions) {
      addOrganismIfDoesntExist(questions);
    });
  } else {
    const err = 'ERROR: Il te faut être un élève pour accéder à cette page d\'ajout d\'heures extra-Simplyk';
    console.error(err);
    res.redirect('/volunteer/map?error=' + err);
  };
});

///////////////////////////////////////-----------------AGENDAS------------------
function sendEmailIfHoursNotValidated(vol_name, todo_id) {

  //Transform date
  let start_date = (new Date()).getTime();
  start_date = moment(start_date).add(5, 'hours');

  const fourDaysAfter = moment(start_date).add(4, 'days');


  console.info('start_date : ' + moment(start_date).format('dddd D MMMM YYYY HH:mm'));
  console.info('fourDaysAfter : ' + moment(fourDaysAfter).format('dddd D MMMM YYYY HH:mm'));
  console.info('start_date : ' + moment(start_date).toString());
  console.info('start_date : ' + moment(start_date).toISOString());
  console.info('fourDaysAfter : ' + moment(fourDaysAfter).toString());
  console.info('fourDaysAfter : ' + moment(fourDaysAfter).toISOString());



  agenda.schedule(moment(fourDaysAfter).toDate(), 'sendHoursPendingOrgReminderEmail', {
    vol_name,
    todo_id: todo_id.toString()
  });
}

module.exports = router;