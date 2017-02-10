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
const getClientSchools = require('../lib/ressources/client_school_list.js').getClientSchools;



router.get('/volunteer/profile', permissions.requireGroup('volunteer'), function(req, res) {
  console.log('Begin get /profile')
  console.log(req.session.volunteer);
  var events_past = [];
  var events_pending = [];
  var events_subscribed = [];
  var events_denied = [];
  var events_confirmed = [];
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
    } else if ((Date.parse(volunteer.events[eventI].day) < Date.now() && volunteer.events[eventI].status === 'confirmed') || volunteer.events[eventI].status == 'corrected' || volunteer.events[eventI].status == 'validated') {
      events_confirmed.push(volunteer.events[eventI]);
    } else if (volunteer.events[eventI].status == 'denied') {
      events_denied.push(volunteer.events[eventI]);
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


  const events_hours_done = events_confirmed.reduce(function(pre, cur, ind, arr) {
    if (arr[ind].hours_done) {
      console.log('pre + arr[ind].hours_done : ' + (pre + arr[ind].hours_done));
      return pre + arr[ind].hours_done;
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


  //VOLUNTEERING_LEVEL
  var vol_level;
  if (volunteer.events.length == 0 && lt_nb == 0) {
    vol_level = 1;
  } else if ((volunteer.events.length > 0 || lt_nb > 0) && events_confirmed.length == 0 && lt_hours_done == 0) {
    vol_level = 2;
  } else if ((events_confirmed.length == 1 && lt_hours_done == 0) || (events_confirmed.length == 0 && lt_hours_done > 0 && lt_hours_done < 5)) {
    vol_level = 3;
  } else if ((events_confirmed.length == 1 && lt_hours_done > 0 && lt_hours_done < 5) || (events_confirmed.length < 4 && events_confirmed.length > 1 && lt_hours_done == 0) || (events_confirmed.length == 0 && lt_hours_done > 4 && lt_hours_done < 25)) {
    vol_level = 4;
  } else if ((events_confirmed.length > 0 && events_confirmed.length < 4 && lt_hours_done > 4 && lt_hours_done < 25) || (events_confirmed.length > 3 && lt_hours_done == 0) || (events_confirmed.length == 0 && lt_hours_done > 24) || (events_confirmed.length > 1 && events_confirmed.length < 4 && lt_hours_done < 5 && lt_hours_done > 0)) {
    vol_level = 5;
  } else if ((events_confirmed.length > 0 && lt_hours_done > 24) || (events_confirmed.length > 3 && lt_hours_done > 0)) {
    vol_level = 6;
  } else {
    vol_level = 0;
  };
  console.log('events_confirmed.length :  ' + events_confirmed.length);
  console.log('extras_hours_done :  ' + extras_hours_done);
  console.log('manuals_hours_done :  ' + manuals_hours_done);
  console.log('lt_hours_done :  ' + lt_hours_done);
  console.log('Volunteer level is : ' + vol_level);
  //Get schools_list
  school_list.getSchoolList('./res/schools_list.csv', function(err, schools_list) {
    if (err) {
      console.error('ERR : ' + err);
    };
    const hash = require('intercom-client').SecureMode.userHash({
      secretKey: process.env.INTERCOM_SECRET_KEY,
      identifier: req.session.volunteer.email
    });
    getClientSchools(function(err, client_schools) {
      if (err) {
        console.error(err);
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
                  return 0;
                }
              }
            }
          }
        }
      });
      console.log('extras sorted : ' + JSON.stringify(req.session.volunteer.extras));
      res.render('v_profile.jade', {
        session: req.session,
        volunteer: req.session.volunteer,
        group: req.session.group,
        error,
        err,
        schools_list,
        vol_level,
        events_subscribed,
        events_confirmed,
        events_pending,
        events_past,
        events_hours_done,
        lt_hours_done,
        manuals_hours_done,
        extras_hours_done,
        hash,
        client_schools,
        events_denied
      });
    });
  });
});

//Unsubscribe from an event
router.post('/volunteer/unsubscribe/:act_id-:day', permissions.requireGroup('volunteer'), function(req, res) {
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
      console.log('Error in unsubscription process : ' + err);
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
          console.log('Error in unsubscription process : ' + err);
        } else {
          function isNotActivity(activity) {
            return activity.activity_id != req.params.activity_id;
          };
          console.log(JSON.stringify(req.session.volunteer));
          req.session.volunteer = newVolunteer;
          //req.session.volunteer.events = req.session.volunter.events.filter(isNotActivity);
          //req.session.save();
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
        }
      })
    }
  });
});

//Unsubscribe from an event
router.post('/volunteer/unsubscribe/longterm/:lt_id', permissions.requireGroup('volunteer'), function(req, res) {
  const lt_id = req.params.lt_id;
  console.log('Unsubscribe process starts');
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
      console.error('ERR : ' + err);
      res.redirect('/volunteer/map?error=' + 'Un problème est survenu lors de la désinscription. Si le problème persite, n\'hésite pas à nous contacter ! :)');
    } else {
      req.session.volunteer = new_volunteer;
      req.session.save(function(err) {
        if (err) {
          console.error('ERR : ' + err);
          res.redirect('/volunteer/map?error=' + 'Un problème est survenu lors de la désinscription. Si le problème persite, n\'hésite pas à nous contacter ! :)');
        } else {
          Organism.findOneAndUpdate({
            'long_terms': {
              '$elemMatch': {
                '_id': lt_id
              }
            }
          }, {
            '$pull': {
              'long_terms.$.applicants': new_volunteer._id
            }
          }, {
            new: true
          }, function(err, new_organism) {
            if (err) {
              console.error('ERR : ' + err);
              res.redirect('/volunteer/map?error=' + 'Un problème est survenu lors de la désinscription. Si le problème persite, n\'hésite pas à nous contacter ! :)');
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
                  console.log(err);
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
  });
});

//Add hours_pending to an activity
router.post('/volunteer/hours_pending/:act_id-:day', permissions.requireGroup('volunteer'), function(req, res) {
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
        console.log(err);
        res.redirect('/volunteer/map?error=' + err);
      } else {
        req.session.volunteer = newVolunteer;
        req.session.save(function() {
          console.log('newVolunteer ' + newVolunteer);

          function isActivity(event) {
            console.log('isActivity : ' + (event.activity_id.toString() == req.params.act_id.toString()));
            return event.activity_id.toString() == req.params.act_id.toString();
          };

          function isDay(event) {
            console.log('isDay ' + (event.day == req.params.day));
            console.log('Date.parse(event.day) ' + Date.parse(event.day));
            console.log('Date.parse(req.params.day) ' + Date.parse(req.params.day));
            return Date.parse(event.day) == Date.parse(req.params.day);
          };
          const event = newVolunteer.events.filter(isActivity).find(isDay);
          if (event.organism_questions) {
            var newTodo = new OrgTodo({
              type: 'hours_pending',
              org_id: event.org_id,
              lastname: newVolunteer.lastname,
              firstname: newVolunteer.firstname,
              vol_id: newVolunteer._id,
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
              lastname: newVolunteer.lastname,
              firstname: newVolunteer.firstname,
              vol_id: newVolunteer._id,
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
            email: true
          }, function(err, orga) {
            if (err) {
              console.log('ERR: hourspendingOrg has not been sent !');
              console.log(err);
            } else {
              emailer.sendHoursPendingOrgEmail({
                firstname: req.session.volunteer.firstname,
                lastname: req.session.volunteer.lastname,
                recipient: orga.email,
                customMessage: [req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname + ' vient de rentrer ses ' + req.body.hours_pending + ' h  de participation à l\'évènement ' + event.intitule + '.', 'Rendez-vous sur la plateforme pour valider ou corriger ces heures de participation !', 'Ceci est très important pour le bénévole !']
              });
            };
          });
          //TODO creation
          newTodo.save(function(err, todo) {
            if (err) {
              console.log(err);
              res.redirect('/volunteer/map?error=' + err);
            } else {
              if (event.student_questions) {
                res.redirect('/volunteer/student_questions/' + req.params.act_id + '-' + req.params.day);
              } else {
                res.redirect('/volunteer/map');
              }
            }
          })
        })
      }
    });
  } else {
    const err = 'ERROR: It seems you didn\'t have complete the hours_done field';
    console.log(err);
    res.redirect('/volunteer/map?error=' + err);
  }
});


//Add hours_pending to an activity
router.post('/volunteer/LThours_pending/:lt_id', permissions.requireGroup('volunteer'), function(req, res) {
  console.log('JSON.stringify(req.body) : ' + JSON.stringify(req.body));
  console.log('JSON.stringify(req.params) : ' + JSON.stringify(req.params));
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
        "long_terms.$.status": 'pending'
      }
    }, {
      returnNewDocument: true,
      new: true
    }, function(err, newVolunteer) {
      if (err) {
        console.log(err);
        res.redirect('/volunteer/map?error=' + err);
      } else {
        req.session.volunteer = newVolunteer;
        req.session.save(function() {
          const new_lt = newVolunteer.long_terms.find(isLongTerm);
          console.log('(typeof new_lt.hours_done == undefined) ' + (typeof new_lt.hours_done == 'undefined'));
          console.log('(new_lt.organism_answers.length<1) ' + (new_lt.organism_answers.length < 1));
          console.log('(newVolunteer.student) ' + (newVolunteer.student));
          console.log('!(lt.hours_pending>0) ' + !(lt.hours_pending > 0));
          console.log(new_lt);
          if ((new_lt.organism_questions.length > 0) && (typeof new_lt.hours_done == 'undefined') && (new_lt.organism_answers.length < 1) && !(lt.hours_pending > 0)) {
            var newTodo = new OrgTodo({
              type: 'LThours_pending',
              org_id: new_lt.org_id,
              lastname: newVolunteer.lastname,
              firstname: newVolunteer.firstname,
              vol_id: newVolunteer._id,
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
              lastname: newVolunteer.lastname,
              firstname: newVolunteer.firstname,
              vol_id: newVolunteer._id,
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
              console.log('ERR: hourspendingOrg has not been sent !');
              console.log(err);
            } else {
              emailer.sendHoursPendingOrgEmail({
                firstname: req.session.volunteer.firstname,
                lastname: req.session.volunteer.lastname,
                recipient: orga.email,
                customMessage: [req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname + ' vient de rentrer ses ' + req.body.hours_pending + ' h  de participation à l\'engagement ' + new_lt.intitule + '.', 'Rendez-vous sur la plateforme pour valider ou corriger ces heures de participation !', 'Ceci est très important pour le bénévole !']
              });
            }
          });
          newTodo.save(function(err, todo) {
            if (err) {
              console.log(err);
            } else {
              console.log('INFO : Todo created : ' + todo);
              if (todo.organism_questions) {
                res.redirect('/volunteer/student_questions/' + req.params.lt_id);
              } else {
                res.redirect('/volunteer/map');
              }
            }
          })
        })
      }
    });
  } else {
    const err = 'ERROR: It seems you didn\'t have complete the hours_done field';
    console.error(err);
    res.redirect('/volunteer/map?error=' + err);
  }
});


router.get('/volunteer/event/:event_id', permissions.requireGroup('volunteer'), function(req, res) {

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
      console.log(err);
      res.redirect('/volunteer/map?error=' + err);
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
          console.log(err);
          res.redirect('/volunteer/map?error=' + err);
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

router.post('/volunteer/addextrahours', permissions.requireGroup('volunteer'), function(req, res) {
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
        '$or': [{
          'email': req.body.org_email.toLowerCase()
        }, {
          'org_name': req.body.org_name
        }, {
          'phone': req.body.org_phone
        }]
      }, function(err, theOrg) {
        if (err) {
          const err = 'Une erreur est survenu lors de la recherche de l\'organisme mentionné dans le formulaire';
          console.error(err);
          res.redirect('/volunteer/map?error=' + err);
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

              emailer.sendHoursPendingOrgEmail({
                firstname: req.session.volunteer.firstname,
                lastname: req.session.volunteer.lastname,
                recipient: req.body.org_email.toLowerCase(),
                customMessage: [req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname + ' vient d\'ajouter ' + req.body.hours_pending + ' h  de participation dans votre organisme.', 'En tant qu\'élève de ' + req.session.volunteer.admin.school_name + ', il a besoin que vous lui validiez ces heures s\'il les a réellement faites. Sinon, il est utile aussi que vous signaliez qu\'il y a une erreur ! :)', 'L\'élève est accessible par téléphone au : ' + req.session.volunteer.phone, 'Rendez-vous sur la plateforme pour valider ou corriger ces heures de participation !', 'Ceci est très important pour le bénévole !']
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
                      link: verifyUrl
                    },
                    customMessage: [req.session.volunteer.firstname + ' ' + req.session.volunteer.lastname + ' est élève à l\'établissement ' + req.session.volunteer.admin.school_name + '.', 'Vous recevez ce message car cet élève mentionne avoir fait ' + req.body.hours_pending + 'h de bénévolat dans votre organisme.', 'Si c\'est bel et bien le cas, venez valider ses heures sur la plateforme Simplyk afin qu\'elles soient comptabiliser par ses professeurs !', 'S\'il n\'a pas fait les heures mentionnées, connectez-vous pour corriger la situation. :) ', 'L\'élève est accessible par téléphone au : ' + req.session.volunteer.phone, 'Vos identifiants de connexion sont les suivants :', 'Email: ' + org_saved.email, 'Mot de passe: ' + passToChange],
                    firstname: req.session.volunteer.firstname,
                    lastname: req.session.volunteer.lastname
                  });
                  console.info('INFO: student add extra hours to an organism which has NOT subscribed to the platform : ' + org_saved.org_name);
                  resolve();
                }
              });

            }

          });

          setTodoAndActivityValuesFromOrganismResults.then(function() {

              newTodo.save(function(err, newTodo_saved) {
                if (err) {
                  console.error(err);
                };
              });
              newActivity.save(function(err, activity_saved) {
                if (err) {
                  console.error(err);
                };
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
                    console.error(err);
                  } else {
                    req.session.volunteer = newVolunteer;
                    req.session.save(function() {
                      res.render('v_postsubscription.jade', {
                        session: req.session,
                        org_name: activity_saved.org_name,
                        volunteer: req.session.volunteer,
                        group: req.session.group,
                        type: 'extra'
                      });
                    });
                  }
                })
              });

            })
            .catch(err => {
              const error = 'Une erreur est survenu lors de la recherche de l\'organisme mentionné dans le formulaire';
              console.error(err);
              res.redirect('/volunteer/map?error=' + error);
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


module.exports = router;
