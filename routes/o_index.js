/*jslint node: true */
'use strict';

var express = require('express');
var router = express.Router();

var Intercom = require('intercom-client');
var emailer = require('../email/emailer.js');
var client = new Intercom.Client({
  token: process.env.INTERCOM_TOKEN
});

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var longtermsList = require('../lib/longterms.js').listFromOrganisms;
var rewindSlotString = require('../lib/slot.js').rewindSlotString;
var date = require('../lib/dates/date_browser.js');
var game = require('../lib/badges.js');

var permissions = require('../middlewares/permissions.js');
var Volunteer = require('../models/volunteer_model.js');
var Organism = require('../models/organism_model.js');
var Activity = require('../models/activity_model.js');
var OrgTodo = require('../models/o_todo_model.js');


var app = express();

var opp_management = require('../middlewares/opp_management.js');


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('Organism index');
  Activity.find({
    'archived': {
      $ne: true
    },
    'validation': true,
    'school_id': {
      $not: {
        $type: 7
      }
    }
  }, function(err, activities) {
    if (err) {
      err.type = 'MINOR';
      next(err);
      console.error(err);
      res.render('g_accueil.jade', {
        session: req.session,
        error: err,
        group: req.session.group
      });
    }
    //Create events list
    else {
      console.info('req.isAuthenticated() : ' + req.isAuthenticated());
      console.info('**************');
      if (req.session) {
        if (req.session.group == 'organism') {
          console.warn('Try to access / but req.session.organism');
          res.redirect('/organism/dashboard');
        } else if (req.session.group == 'volunteer') {
          console.warn('Try to access / but req.session.volunteer');
          res.redirect('/volunteer/map');
        } else if (req.session.group == 'admin') {
          console.warn('Try to access / but req.session.admin');
          res.redirect('/admin/classes');
        } else {
          var isNotPassed = function(activity) {
            var days_length = activity.days.filter(function(day) {
              return day.day > Date.now();
            });
            return days_length.length > 0;
          };
          let remainingPlaces = function(activity) {
            let remain = (activity.days.filter(function(day) {
              return day.vol_nb > day.applicants.length;
            })).length;
            return remain > 0;
          };
          console.log('activities.length : ' + activities.length);
          const acts = activities.filter(isNotPassed).filter(remainingPlaces);
          console.log('acts.length : ' + acts.length);
          //Select organisms who have longterms and are not admin ones
          Organism.find({
            'validation': true,
            'school_id': {
              $not: {
                $type: 7
              }
            },
            'long_terms': {
              '$not': {
                '$size': 0
              }
            }
          }, {
            'org_name': true,
            'cause': true,
            '_id': true,
            'long_terms': true,
            'school_id': true,
            'admin_id': true
          }, function(err, organisms) {
            if (err) {
              err.type = 'MINOR';
              next(err);
              res.render('g_accueil.jade', {
                session: req.session,
                error: err,
                organism: req.session.organism,
                group: req.session.group
              });
            } else {
              //Get the longterms from all the organisms which are not a school
              var longterms = longtermsList(organisms.filter(function(orga) {
                if (orga.school_id || orga.admin_id) {
                  return false;
                } else {
                  return true;
                }
              }), null);
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
                if (lt.long_term.min_age >= 16) {
                  adult_indexes.push(lt.long_term._id);
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
                if (act.min_age >= 16) {
                  adult_indexes.push(act._id);
                }
              })
              const first_age_filtered = true;
              res.render('g_accueil.jade', {
                activities: acts,
                session: req.session,
                longterms: longterms,
                error: req.query.error,
                group: req.session.group,
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
      } else {
        var isNotPassed = function(activity) {
          var days_length = activity.days.filter(function(day) {
            return day.day > Date.now();
          });
          return days_length.length > 0;
        };
        const actis = activities.filter(isNotPassed);
        res.render('g_accueil.jade', {
          activities: actis,
          session: req.session,
          error: req.query.error,
          group: req.session.group
        });
      }
    }
  });
});

router.get('/organism/dashboard', permissions.requireGroup('organism', 'admin'), function(req, res, next) {
  console.info('req.body : ' + req.body);
  if (req.body.org) {
    req.session.organism = req.body.org;
    console.info('organism refreshed !');
  };
  Activity.find({
    'org_id': req.session.organism._id
  }, function(err, activities) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème lors de la lecture de vos bénévolats';
      next(err);
    } else {
      var events = req.session.organism.events;
      var ev_past = [];
      var ev_to_come = [];
      for (var eventI = events.length - 1; eventI >= 0; eventI--) {
        events[eventI].acts = [];
        console.info('******************');

        function inThisEvent(activity) {
          return (events[eventI].activities.indexOf(activity._id.toString()) >= 0);
        }
        var these_activities = activities.filter(inThisEvent);
        Array.prototype.push.apply(events[eventI].acts, these_activities);
        var lastDay = events[eventI].dates[0];
        for (var dateI = events[eventI].dates.length - 1; dateI >= 0; dateI--) {
          if (Date.parse(events[eventI].dates[dateI]) > Date.parse(lastDay)) {
            lastDay = events[eventI].dates[dateI];
          }
        }
        console.info('LastDay of the event : ' + lastDay);
        if (Date.parse(lastDay) > Date.now()) {
          ev_to_come.push(events[eventI]);
        } else if (Date.parse(lastDay) < Date.now()) {
          ev_past.push(events[eventI]);
        }
      }
      //Find TODO
      OrgTodo.find({
        org_id: req.session.organism._id
      }, function(err, todos) {
        if (err) {
          err.type = 'MINOR';
          next(err);
          res.render('g_accueil.jade', {
            session: req.session,
            error: err,
            organism: req.session.organism,
            group: req.session.group
          });
        } else {
          //Add event_name to a todo
          function addEventName(td) {
            if (td.type == 'hours_pending') {
              var todo = JSON.parse(JSON.stringify(td));
              todo.event_name = null;

              //Find the organism.event correspnding to the todo
              function containsActivity(event) {
                const act_found = event.activities.find(act => {
                  return act.toString() == todo.activity_id.toString();
                });
                return ((act_found) ? true : false);
              }

              const considered_event = req.session.organism.events.find(containsActivity);
              console.info('considered_event : ' + considered_event);
              todo.event_name = considered_event.intitule;
              return todo;
            } else {
              return td;
            }
          }
          const hash = require('intercom-client').SecureMode.userHash({
            secretKey: process.env.INTERCOM_SECRET_KEY,
            identifier: req.session.organism._id
          });

          req.session.organism.long_terms.sort((a, b) => {
            console.log(a.tags + ' vs ' + b.tags);
            if (a.tags == 'archived' && b.tags != 'archived') {
              console.log('-1');
              return 1;
            } else if (a.tags != 'archived' && b.tags == 'archived') {
              console.log('1');
              return -1;
            } else {
              console.log('0');
              return 0;
            }
          });

          var todo_to_send = todos.map(addEventName);
          res.render('o_dashboard.jade', {
            ev_past: ev_past,
            error: req.query.error,
            ev_to_come: ev_to_come,
            session: req.session,
            organism: req.session.organism,
            todos: todo_to_send,
            group: req.session.group,
            message: req.query.message,
            hash
          });
        }
      });
    }
  });
});

router.get('/organism/event/:event_id', permissions.requireGroup('organism', 'admin'), function(req, res, next) {
  function isEvent(event) {
    console.info('Test : ' + event._id + ' = ' + req.params.event_id + ' ?');
    return event._id.toString() === req.params.event_id;
  }
  var event = req.session.organism.events.find(isEvent);
  if (event) {
    var acts_id = event.activities;
    Activity.find({
      '_id': {
        '$in': acts_id
      }
    }, function(err, activities) {
      if (err) {
        err.type = 'CRASH';
        err.print = 'Problème pour récupérer les informations du bénévolat';
        next(err);
      } else {
        Volunteer.find({
          'events': {
            '$elemMatch': {
              'activity_id': {
                '$in': acts_id
              }
            }
          }
        }, function(err, volunteers) {
          if (err) {
            err.type = 'CRASH';
            err.print = 'Problème pour récupérer la liste des inscrits au bénévolat';
            next(err);
          } else {
            var activities_list = activities;
            event.acts = [];
            for (var actI = activities_list.length - 1; actI >= 0; actI--) {
              for (var daysI = activities_list[actI].days.length - 1; daysI >= 0; daysI--) {
                activities_list[actI].days[daysI].vols = [];
                var vols = [];

                function goodEvent(event) {
                  return ((event.activity_id.toString() === activities_list[actI]._id.toString()) && (Date.parse(event.day) === Date.parse(activities_list[actI].days[daysI].day)));
                }

                function isParticipating(volunteer) {
                  var result = volunteer.events.find(goodEvent);
                  return typeof result !== 'undefined';
                }
                var these_volunteers = volunteers.filter(isParticipating);


                Array.prototype.push.apply(activities_list[actI].days[daysI].vols, these_volunteers);
              }
            }


            Array.prototype.push.apply(event.acts, activities_list);
            let error = {};
            if (req.query.error) {
              error = req.query.error;

            };
            //res.json(event);
            res.render('o_event.jade', {
              session: req.session,
              event: event,
              organism: req.session.organism,
              group: req.session.group,
              date,
              error
            });
          }
        });
      }
    });
  } else {
    const err = {};
    err.print = 'Évènement non trouvé';
    err.type = 'MINOR';
    next(err);
    res.redirect('/organism/dashboard?error=' + err);
  }
});

/*GET map page*/
router.get('/organism/map', permissions.requireGroup('organism', 'admin'), function(req, res, next) {
  Activity.find({
    'archived': {
      $ne: true
    },
    'validation': true
  }, function(err, activities) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème pour récupérer la liste des bénévolats';
      next(err);
    } else {
      //Create opps list
      let my_school = null;
      if (req.session.organism.school_id) {
        my_school = req.session.organism.school_id;
      };
      var isNotPassed = function(activity) {
        var days_length = activity.days.filter(function(day) {
          return day.day > Date.now();
        });
        return days_length.length > 0;
      };

      const isNotAnExtra = function(activity) {
        return !activity.extra;
      };

      var justMySchool = function(activity) {
        if (activity.school_id) {
          if (my_school) {
            console.log('activity.school_id :' + activity.school_id + ' my_school : ' + my_school + 'activity.school_id == my_school' + (activity.school_id == my_school));
            return activity.school_id.toString() == my_school.toString();
          } else {
            return false;
          };
        } else {
          return true;
        }
      };

      //If user is under 16, he can't see the activities of unverified organisms
      let acts = {};
      let lt_filter = {};
      acts = activities.filter(isNotPassed).filter(isNotAnExtra).filter(justMySchool);
      lt_filter = {
        'long_terms': {
          '$not': {
            '$size': 0
          }
        }
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
          err.print = 'Problème pour récupérer la liste des organisms et de leurs activités';
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
          var longterms = longtermsList(lt_organisms, 80);
          const hash = require('intercom-client').SecureMode.userHash({
            secretKey: process.env.INTERCOM_SECRET_KEY,
            identifier: req.session.organism._id
          });
          console.info('hash : ' + hash);
          console.info('typeof hash : ' + typeof hash);
          let school_name = null;
          if (my_school) {
            console.info((/\(([^)]+)\)/).exec(req.session.organism.org_name)[1]);
            school_name = (/\(([^)]+)\)/).exec(req.session.organism.org_name)[1];
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
            volunteer: {},
            organism: req.session.organism,
            error: req.query.error,
            success: req.query.success,
            group: req.session.group,
            school_name,
            longterms,
            hash,
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

router.get('/organism/longterm/:lt_id', permissions.requireGroup('organism', 'admin'), function(req, res, next) {
  console.info('In GET to a longterm page with lt_id:' + req.params.lt_id);
  let error = null;
  if (req.query.error) {
    error = req.query.error;
  };

  function isRightLongterm(long) {
    console.info('long._id == req.params.lt_id : ' + (long._id.toString() == req.params.lt_id) + long._id + '  ' + req.params.lt_id);
    return long._id.toString() == req.params.lt_id;
  }
  var longterm = req.session.organism.long_terms.find(isRightLongterm);
  console.info('+++++++++++++++++++++');
  console.info('Longterm corresponding to lt_id : ' + longterm);
  console.info('+++++++++++++++++++++');
  if (longterm) {
    Volunteer.find({
      'long_terms': {
        '$elemMatch': {
          '_id': {
            '$in': req.params.lt_id
          }
        }
      }
    }, {
      'email': 1,
      'long_terms.$': 1,
      'firstname': 1,
      'lastname': 1,
      'birthdate': 1,
      'phone': 1
    }, function(err, volunteers) {
      if (err) {
        err.type = 'CRASH';
        err.print = 'Problème pour récupérer la liste des inscrits au bénévolat';
        next(err);
      } else {
        var slotJSON = rewindSlotString(longterm.slot);
        res.render('o_longterm.jade', {
          session: req.session,
          lt_id: req.params.lt_id,
          organism: req.session.organism,
          longterm: longterm,
          slotJSON: slotJSON,
          volunteers: volunteers,
          group: req.session.group,
          date,
          error
        });
      }
    });
  } else {
    const err = {};
    err.print = 'Engagement non disponible';
    err.type = 'MINOR';
    next(err);
    res.redirect('/organism/dashboard?error=' + err);
  }
});


router.post('/organism/correcthours', function(req, res, next) {
  console.info('Correct Hours starts');
  const correct_hours = req.body.correct_hours;
  console.info('DATAS : req.body : ' + JSON.stringify(req.body));
  // INIT ORG_ID AND ORG_NAME
  let org_id = {};
  let org_name = {};
  console.log('GROUP : ' + req.session.group);
  if (req.session.group == 'organism' || req.session.group == 'admin') {
    org_id = req.session.organism._id;
    org_name = req.session.organism.org_name;
  } else if (req.body.org_id) {
    org_id = req.body.org_id;
    org_name = req.body.org_name;
  } else {
    let err = {};
    console.error('ERROR IN CORRECT HOURS where we cant organism');
    err.type = 'MINOR';
    next(err);
    res.sendStatus(404);
  }
  console.info('Correct_hours: ' + correct_hours);
  Volunteer.findOne({
    _id: req.body.vol_id
  }, function(err, myVolunteer) {
    if (err) {
      err.type = 'MINOR';
      next(err);
      res.sendStatus(404);
    } else if (myVolunteer) {
      var type = req.body.type;
      console.info('myvolunteer exists');
      console.info('MyVolunteer : ' + JSON.stringify(myVolunteer));
      if (typeof req.body.act_id !== 'undefined') {
        console.info('Correct hours for an activity !');
        if (type == 'hours_pending') {
          const theactivity = myVolunteer.events.find(function(event) {
            return event.activity_id.toString() == req.body.act_id.toString();
          });
          var activity_name = theactivity.intitule;
          var query = {
            '_id': req.body.vol_id,
            'events': {
              '$elemMatch': {
                'activity_id': req.body.act_id,
                'day': req.body.day
              }
            }
          };
        } else if (type == 'students_hours_pending') {
          const theactivity = myVolunteer.extras.find(function(event) {
            return event.activity_id.toString() == req.body.act_id.toString();
          });
          var activity_name = theactivity.intitule;
          var query = {
            '_id': req.body.vol_id,
            'extras': {
              '$elemMatch': {
                'activity_id': req.body.act_id
              }
            }
          };
        }
      } else if (typeof req.body.lt_id !== 'undefined') {
        console.info('Correct hours for a longterm !');
        var query = {
          '_id': req.body.vol_id,
          'long_terms': {
            '$elemMatch': {
              '_id': req.body.lt_id
            }
          }
        };
        //Check if hours_pending different from 0 (meaning OrgTodo already done)
        const thelt = myVolunteer.long_terms.find(function(lt) {
          return lt._id.toString() == req.body.lt_id;
        });
        var activity_name = thelt.intitule;
        if (thelt.hours_pending >= req.body.hours_before) {
          var already_done = false;
        } else {
          var already_done = true;
        }
      }
      console.info('query : ' + JSON.stringify(query));
      if (!already_done) {
        Volunteer.findOne(query, function(err, vol) {
          if (err) {
            err.type = 'MINOR';
            next(err);
            res.sendStatus(404);
          } else {
            // Find status of the opp to see if it's refused and then don't change it
            let opp_status = {};
            if (typeof req.body.act_id !== 'undefined') {

              if (req.body['answers[0][value]']) {
                console.info('req.body.answers[0][value] : ' + req.body['answers[0][value]']);
                //i starts from 1 to avoid to select the number answered as corrected hours
                var i = 1;
                var answers = [];
                while (req.body['answers[' + i + '][value]']) {
                  console.info('Add to answers : ' + req.body['answers[' + i + '][value]']);
                  answers.push(req.body['answers[' + i + '][value]']);
                  i++;
                }
                console.info('Answers : ' + JSON.stringify(answers));
                if (type == 'hours_pending') {
                  if (opp_status = vol.events.find(ev => {
                      return ev.activity_id == req.body.act_id;
                    }).status != 'refused') {
                    var update = {
                      '$set': {
                        'events.$.hours_done': correct_hours,
                        'events.$.hours_pending': 0,
                        'events.$.status': 'confirmed',
                        'events.$.organism_answers': answers
                      }
                    };
                  } else {
                    var update = {
                      '$set': {
                        'events.$.hours_done': correct_hours,
                        'events.$.hours_pending': 0,
                        'events.$.organism_answers': answers
                      }
                    };
                  };
                } else if (type == 'students_hours_pending') {
                  if (opp_status = vol.extras.find(ex => {
                      return ex.activity_id == req.body.act_id;
                    }).status != 'refused') {
                    var update = {
                      '$set': {
                        'extras.$.hours_done': correct_hours,
                        'extras.$.hours_pending': 0,
                        'extras.$.status': 'confirmed',
                        'extras.$.organism_answers': answers
                      }
                    };
                  } else {
                    var update = {
                      '$set': {
                        'extras.$.hours_done': correct_hours,
                        'extras.$.hours_pending': 0,
                        'extras.$.organism_answers': answers
                      }
                    };
                  };
                }
              } else {
                if (type == 'hours_pending') {
                  if (opp_status = vol.events.find(ev => {
                      return ev.activity_id == req.body.act_id;
                    }).status != 'refused') {
                    var update = {
                      '$set': {
                        'events.$.hours_done': correct_hours,
                        'events.$.hours_pending': 0,
                        'events.$.status': 'confirmed'
                      }
                    };
                  } else {
                    var update = {
                      '$set': {
                        'events.$.hours_done': correct_hours,
                        'events.$.hours_pending': 0
                      }
                    };
                  };
                } else if (type == 'students_hours_pending') {
                  if (opp_status = vol.extras.find(ex => {
                      return ex.activity_id == req.body.act_id;
                    }).status != 'refused') {
                    var update = {
                      '$set': {
                        'extras.$.hours_done': correct_hours,
                        'extras.$.hours_pending': 0,
                        'extras.$.status': 'confirmed'
                      }
                    };
                  } else {
                    var update = {
                      '$set': {
                        'extras.$.hours_done': correct_hours,
                        'extras.$.hours_pending': 0
                      }
                    };
                  };
                }
              }
            } else if (typeof req.body.lt_id !== 'undefined') {

              if (req.body['answers[0][value]']) {
                console.info('req.body.answers[0][value] : ' + req.body['answers[0][value]']);
                //i starts from 1 to avoid to select the number answered as corrected hours
                var i = 1;
                var answers = [];
                while (req.body['answers[' + i + '][value]']) {
                  console.info('Add to answers : ' + req.body['answers[' + i + '][value]']);
                  answers.push(req.body['answers[' + i + '][value]']);
                  i++;
                }
                console.info('Answers : ' + JSON.stringify(answers));
                if (opp_status = vol.long_terms.find(lt => {
                    return lt._id == req.body.lt_id;
                  }).status != 'refused') {
                  var update = {
                    '$inc': {
                      'long_terms.$.hours_done': correct_hours,
                      'long_terms.$.hours_pending': -req.body.hours_before
                    },
                    '$set': {
                      'long_terms.$.organism_answers': answers,
                      'long_terms.$.status': 'confirmed'
                    }
                  };
                } else {
                  var update = {
                    '$inc': {
                      'long_terms.$.hours_done': correct_hours,
                      'long_terms.$.hours_pending': -req.body.hours_before
                    },
                    '$set': {
                      'long_terms.$.organism_answers': answers
                    }
                  };
                };
              } else {
                if (opp_status = vol.long_terms.find(lt => {
                    return lt._id == req.body.lt_id;
                  }).status != 'refused') {
                  var update = {
                    '$inc': {
                      'long_terms.$.hours_done': correct_hours,
                      'long_terms.$.hours_pending': -req.body.hours_before
                    },
                    '$set': {
                      'long_terms.$.status': 'confirmed'
                    }
                  };
                } else {
                  var update = {
                    '$inc': {
                      'long_terms.$.hours_done': correct_hours,
                      'long_terms.$.hours_pending': -req.body.hours_before
                    }
                  };
                };
              }
            };

            console.log('update : ' + update);

            Volunteer.findOneAndUpdate(query, update, {
              new: true
            }, function(err, volunteer_updated) {
              if (err) {
                err.type = 'MINOR';
                next(err);
                res.sendStatus(404);
              } else {
                //Intercom create addlongterm event
                client.events.create({
                  event_name: 'org_correcthours',
                  created_at: Math.round(Date.now() / 1000),
                  user_id: org_id,
                  metadata: {
                    act_id: req.body.act_id,
                    lt_id: req.body.lt_id
                  }
                });
                client.users.update({
                  user_id: org_id,
                  update_last_request_at: true
                });
                //Send email to felicitate the volunteer
                emailer.sendHoursConfirmedVolEmail({
                  firstname: myVolunteer.firstname,
                  recipient: myVolunteer.email,
                  activity_name: activity_name,
                  customMessage: org_name + ' vient de valider ta participation de ' + correct_hours + ' h (nombre d\'heures corrigés par l\'organisme) à ' + activity_name + ' !'
                });
                OrgTodo.findOneAndRemove({
                  _id: req.body.todo
                }, function(err, todoremoved) {
                  if (err) {
                    console.error(err);
                  } else {
                    console.info('todoremoved : ' + todoremoved);
                  }
                });
                console.info('Hours_pending goes to hours_done with corrected_hours : ' + req.body.correct_hours);
                res.sendStatus(200);
                game.refreshPreferences(volunteer_updated, function(err, volunteer_refreshed) {
                  if (err) {
                    err.type = 'MINOR';
                    err.print = 'Problème de mise à jour des préférences du bénévole dans la base de données';
                    next(err);
                  }
                });
              }
            });
          }
        });
      } else {
        let err = {};
        err.stack = 'It seems that the todo has already been done since the hours_pending in volunteer is less than the hours in the TODO';
        err.type = 'MINOR';
        next(err);
        console.error('ERR : It seems that the todo has already been done since the hours_pending in volunteer is less than the hours in the TODO');
        res.sendStatus(404);
      }
    } else {
      let err = {};
      err.stack = 'Volunteer doesnt exist';
      err.type = 'MINOR';
      next(err);
      console.warn('MyVolunteer doesnt exist');
      res.sendStatus(404);
    }
  });
});

router.post('/organism/confirmhours', function(req, res, next) {
  console.info('Confirm Hours starts');
  // INIT ORG_ID AND ORG_NAME
  let org_id = {};
  let org_name = {};
  if (req.session.group == 'organism' || req.session.group == 'admin') {
    org_id = req.session.organism._id;
    org_name = req.session.organism.org_name;
  } else if (req.body.org_id) {
    org_id = req.body.org_id;
    org_name = req.body.org_name;
  } else {
    let err = {};
    console.error('ERROR IN CONFIRM HOURS where we cant organism');
    err.type = 'MINOR';
    next(err);
    res.sendStatus(404);
  }
  Volunteer.findOne({
    _id: req.body.vol_id
  }, function(err, myVolunteer) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème pour mettre à jour les informations du bénévole';
      next(err);
    } else if (myVolunteer) {
      console.info('myvolunteer exists');
      console.info('MyVolunteer : ' + JSON.stringify(myVolunteer.email));
      var type = req.body.type;
      var hours_pending = req.body.hours;
      console.info('hours_pending : ' + hours_pending);
      console.info('JSON.stringify(req.body) : ' + JSON.stringify(req.body));
      var update = {};
      //Intercom create addlongterm event
      client.events.create({
        event_name: 'org_confirmhours',
        created_at: Math.round(Date.now() / 1000),
        user_id: org_id,
        metadata: {
          act_id: req.body.act_id,
          lt_id: req.body.lt_id
        }
      });
      client.users.update({
        user_id: org_id,
        update_last_request_at: true
      });
      //If we deal with an event
      if (req.body.act_id) {
        if (type == 'hours_pending') {
          var activity_name = (myVolunteer.events.find(function(eve) {
            return eve.activity_id.toString() == req.body.act_id.toString();
          })).intitule;
          var query = {
            '_id': req.body.vol_id,
            'events': {
              '$elemMatch': {
                'activity_id': req.body.act_id,
                'day': req.body.day
              }
            }
          };
        } else if (type == 'students_hours_pending') {
          var activity_name = (myVolunteer.extras.find(function(eve) {
            return eve.activity_id.toString() == req.body.act_id.toString();
          })).intitule;
          var query = {
            '_id': req.body.vol_id,
            'extras': {
              '$elemMatch': {
                'activity_id': req.body.act_id
              }
            }
          };
        }
        //If we deal with a longterm
      } else if (req.body.lt_id) {
        var activity_name = (myVolunteer.long_terms.find(function(lt) {
          return lt._id.toString() == req.body.lt_id.toString();
        })).intitule;
        var query = {
          '_id': req.body.vol_id,
          'long_terms': {
            '$elemMatch': {
              '_id': req.body.lt_id
            }
          }
        };
      }

      //Send email to felicitate the volunteer
      emailer.sendHoursConfirmedVolEmail({
        firstname: myVolunteer.firstname,
        recipient: myVolunteer.email,
        activity_name: activity_name,
        customMessage: org_name + ' vient de valider ta participation de ' + hours_pending + ' h à ' + activity_name + ' !'
      });
      Volunteer.findOne(query, function(err, vol) {
        if (err) {
          err.type = 'MINOR';
          next(err);
          res.sendStatus(404);
        } else {
          // Find status of the opp to see if it's refused and then don't change it
          let opp_status = {};
          if (typeof req.body.act_id !== 'undefined') {

            //If we deal with a student
            if (req.body['answers[0][value]']) {
              console.info('req.body.answers[0][value] : ' + req.body['answers[0][value]']);
              var i = 0;
              var answers = [];
              while (req.body['answers[' + i + '][value]']) {
                console.info('Add to answers : ' + req.body['answers[' + i + '][value]']);
                answers.push(req.body['answers[' + i + '][value]']);
                i++;
              }
              console.info('Answers : ' + JSON.stringify(answers));
              if (type == 'hours_pending') {
                // IF status != refused
                if (opp_status = vol.events.find(ev => {
                    return ev.activity_id == req.body.act_id;
                  }).status != 'refused') {
                  var update = {
                    '$set': {
                      'events.$.hours_done': hours_pending,
                      'events.$.hours_pending': 0,
                      'events.$.status': 'confirmed',
                      'events.$.organism_answers': answers
                    }
                  };
                } else {
                  var update = {
                    '$set': {
                      'events.$.hours_done': hours_pending,
                      'events.$.hours_pending': 0,
                      'events.$.organism_answers': answers
                    }
                  };
                };
              } else if (type == 'students_hours_pending') {
                if (opp_status = vol.extras.find(ex => {
                    return ex.activity_id == req.body.act_id;
                  }).status != 'refused') {
                  var update = {
                    '$set': {
                      'extras.$.hours_done': hours_pending,
                      'extras.$.hours_pending': 0,
                      'extras.$.status': 'confirmed',
                      'extras.$.organism_answers': answers
                    }
                  };
                } else {
                  var update = {
                    '$set': {
                      'extras.$.hours_done': hours_pending,
                      'extras.$.hours_pending': 0,
                      'extras.$.organism_answers': answers
                    }
                  };
                };
              }
            } else {
              if (type == 'hours_pending') {
                // IF status != refused
                if (opp_status = vol.events.find(ev => {
                    return ev.activity_id == req.body.act_id;
                  }).status != 'refused') {
                  var update = {
                    '$set': {
                      'events.$.hours_done': hours_pending,
                      'events.$.hours_pending': 0,
                      'events.$.status': 'confirmed'
                    }
                  };
                } else {
                  var update = {
                    '$set': {
                      'events.$.hours_done': hours_pending,
                      'events.$.hours_pending': 0
                    }
                  };
                };
              } else if (type == 'students_hours_pending') {
                if (opp_status = vol.extras.find(ex => {
                    return ex.activity_id == req.body.act_id;
                  }).status != 'refused') {
                  var update = {
                    '$set': {
                      'extras.$.hours_done': hours_pending,
                      'extras.$.hours_pending': 0,
                      'extras.$.status': 'confirmed'
                    }
                  };
                } else {
                  var update = {
                    '$set': {
                      'extras.$.hours_done': hours_pending,
                      'extras.$.hours_pending': 0
                    }
                  };
                };
              }
              console.info('NO answers');
            }
          } else if (typeof req.body.lt_id !== 'undefined') {
            if (opp_status = vol.long_terms.find(lt => {
                return lt._id == req.body.lt_id;
              }).status != 'refused') {
              //If we deal with a student
              if (req.body['answers[0][value]']) {
                console.info('req.body.answers[0][value] : ' + req.body['answers[0][value]']);
                var i = 0;
                var answers = [];
                while (req.body['answers[' + i + '][value]']) {
                  console.info('Add to answers : ' + req.body['answers[' + i + '][value]']);
                  answers.push(req.body['answers[' + i + '][value]']);
                  i++;
                }
                console.info('Answers : ' + JSON.stringify(answers));
                var update = {
                  '$inc': {
                    'long_terms.$.hours_done': hours_pending,
                    'long_terms.$.hours_pending': -hours_pending
                  },
                  '$set': {
                    'long_terms.$.organism_answers': answers,
                    'long_terms.$.status': 'confirmed'
                  }
                };
              } else {
                console.info('NO answers');
                var update = {
                  '$inc': {
                    'long_terms.$.hours_done': hours_pending,
                    'long_terms.$.hours_pending': -hours_pending
                  },
                  '$set': {
                    'long_terms.$.status': 'confirmed'
                  }
                };
              };
            } else {
              //If we deal with a student
              if (req.body['answers[0][value]']) {
                console.info('req.body.answers[0][value] : ' + req.body['answers[0][value]']);
                var i = 0;
                var answers = [];
                while (req.body['answers[' + i + '][value]']) {
                  console.info('Add to answers : ' + req.body['answers[' + i + '][value]']);
                  answers.push(req.body['answers[' + i + '][value]']);
                  i++;
                }
                console.info('Answers : ' + JSON.stringify(answers));
                var update = {
                  '$inc': {
                    'long_terms.$.hours_done': hours_pending,
                    'long_terms.$.hours_pending': -hours_pending
                  },
                  '$set': {
                    'long_terms.$.organism_answers': answers
                  }
                };
              } else {
                console.info('NO answers');
                var update = {
                  '$inc': {
                    'long_terms.$.hours_done': hours_pending,
                    'long_terms.$.hours_pending': -hours_pending
                  }
                };
              };
            };
          };

          Volunteer.findOneAndUpdate(query, update, {
            new: true
          }, function(err, volunteer_updated) {
            if (err) {
              err.type = 'MINOR';
              next(err);
              res.sendStatus(404);
            } else {
              console.info('Hours_pending goes to hours_done : ' + hours_pending);
              console.info(req.body);
              OrgTodo.findOneAndRemove({
                _id: req.body.todo
              }, function(err, todoremoved) {
                if (err) {
                  console.error(err);
                } else {
                  console.info('todoremoved : ' + todoremoved);
                }
              });
              res.sendStatus(200);
              game.refreshPreferences(volunteer_updated, function(err, volunteer_refreshed) {
                if (err) {
                  err.type = 'MINOR';
                  err.print = 'Problème de mise à jour des préférences du bénévole dans la base de données';
                  next(err);
                }
              });
            }
          });
        }
      });
    } else {
      let err = {};
      err.stack = 'Volunteer doesnt exist';
      err.type = 'MINOR';
      next(err);
      res.sendStatus(404);
    }
  });
});

router.get('/organism/validate_extra/:todo_id', function(req, res, next) {
  let nextUrl = '/login';
  let verifyNext = false;
  console.log('req.params.todo_id : ' + req.params.todo_id);
  if (req.session.group == 'organism') {
    nextUrl = '/organism/dashboard';
  };
  if (req.query.verify) {
    console.log('We verify Url also : ' + req.query.verify);
    nextUrl = req.query.verify + '?type=postextra';
    verifyNext = true;
  }
  OrgTodo.findOne({
    '_id': req.params.todo_id.toString()
  }, function(err, todo) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème de validation de la participation de l\'élève';
      next(err);
    } else {
      if (todo) {
        console.log('TO_DO to validate : ' + JSON.stringify(todo));
        //If organism already connected
        if (req.session.group == 'organism') {
          res.render('o_validate_extra.jade', {
            organism: req.session.organism,
            group: req.session.group,
            todo,
            nextUrl,
            verifyNext
          });
        } else {
          Organism.findOne({
            '_id': todo.org_id
          }, function(err, org) {
            if (err) {
              err.type = 'CRASH';
              err.print = 'Problème de validation de la participation de l\'élève';
              next(err);
            } else {
              res.render('o_validate_extra.jade', {
                organism: org,
                todo,
                nextUrl,
                verifyNext
              });
            }
          });
        }
      } else {
        let err = {};
        err.type = 'NORMAL';
        err.print = 'Il semblerait que la participation du bénévole ait déjà été validée';
        next(err);
      }
    }
  });
});

router.get(/dashboard/, permissions.requireGroup('organism', 'admin'), function(req, res) {
  res.redirect('/dashboard');
});

module.exports = router;