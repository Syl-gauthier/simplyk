/*jslint node: true */

var express = require('express');
var router = express.Router();
var passport = require('passport');
var jade = require('jade');

var GoogleMapsAPI = require('googlemaps');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var longtermsList = require('../lib/longterms.js').listFromOrganisms;
var rewindSlotString = require('../lib/slot.js').rewindSlotString;

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
  Activity.find({}, function(err, activities) {
    console.log(activities);
    if (err) {
      console.log(err);
      res.render('g_accueil.jade', {
        session: req.session,
        error: err,
        group: req.session.group
      });
    }
    //Create events list
    else {
      console.log('req.isAuthenticated() : ' + req.isAuthenticated());
      console.log('**************');
      if (req.session) {
        if (req.session.organism) {
          console.log('Try to access / but req.session.organism');
          res.redirect('/organism/dashboard');
        } else if (req.session.volunteer) {
          console.log('Try to access / but req.session.volunteer');
          res.redirect('/volunteer/map');
        } else {
          var isNotPassed = function(activity) {
            var days_length = activity.days.filter(function(day) {
              return day.day > Date.now();
            });
            return days_length.length > 0;
          };
          var isNotASchool = function(activity) {
            return !(activity.school_id);
          };
          const acts = activities.filter(isNotPassed).filter(isNotASchool);
          //Select organisms who have longterms and are not admin ones
          Organism.find({
            'long_terms': {
              '$exists': true,
              '$not': {
                '$size': 0
              }
            },
            'school_id': {
              '$not': {
                '$exists': true
              }
            }
          }, {
            'org_name': true,
            'cause': true,
            '_id': true,
            'long_terms': true
          }, function(err, organisms) {
            if (err) {
              console.log(err);
              res.render('g_accueil.jade', {
                session: req.session,
                error: err,
                organism: req.session.organism,
                group: req.session.group
              });
            } else {
              var longterms = longtermsList(organisms);
              console.log('LONG' + organisms);
              res.render('g_accueil.jade', {
                activities: acts,
                session: req.session,
                longterms: longterms,
                error: req.query.error,
                group: req.session.group
              });
            }
          });
        };
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
    };
  });
});

router.get('/organism/dashboard', permissions.requireGroup('organism', 'admin'), function(req, res) {
  console.log('req.body : ' + req.body);
  if (req.body.org) {
    req.session.organism = req.body.org;
    console.log('organism refreshed !');
  };
  Activity.find({
    "org_id": req.session.organism._id
  }, function(err, activities) {
    if (err) {
      console.log(err);
      res.render('g_accueil.jade', {
        session: req.session,
        error: err,
        organism: req.isAuthenticated(),
        group: req.session.group
      });
    } else {
      var events = req.session.organism.events;
      var ev_past = [];
      var ev_to_come = [];
      var error;
      for (var eventI = events.length - 1; eventI >= 0; eventI--) {
        events[eventI].acts = [];
        console.log('******************');

        function inThisEvent(activity) {
          return (events[eventI].activities.indexOf(activity._id.toString()) >= 0);
        };
        var these_activities = activities.filter(inThisEvent);
        console.log('In the event ' + events[eventI]._id + 'where activitieslist is :' + events[eventI].activities + ' , the activities are : ' + these_activities)
        Array.prototype.push.apply(events[eventI].acts, these_activities);
        var lastDay = events[eventI].dates[0];
        for (var dateI = events[eventI].dates.length - 1; dateI >= 0; dateI--) {
          if (Date.parse(events[eventI].dates[dateI]) > Date.parse(lastDay)) {
            lastDay = events[eventI].dates[dateI];
          };
        };
        console.log('LastDay of the event : ' + lastDay);
        if (Date.parse(lastDay) > Date.now()) {
          ev_to_come.push(events[eventI]);
        } else if (Date.parse(lastDay) < Date.now()) {
          ev_past.push(events[eventI]);
        }
      };
      console.log('ev_past : ' + ev_past + ' ev_to_come :' + JSON.stringify(ev_to_come));
      //Find TODO
      OrgTodo.find({
        org_id: req.session.organism._id
      }, function(err, todos) {
        if (err) {
          console.log(err);
          res.render('g_accueil.jade', {
            session: req.session,
            error: err,
            organism: req.session.organism,
            group: req.session.group
          });
        } else {
          function addEventName(td) {
            if (td.type == 'hours_pending') {
              var todo = JSON.parse(JSON.stringify(td));
              todo.event_name = null;

              function containsActivity(event) {
                var isIt = event.activities.find(function(act) {
                  return act.$oid == todo.activity_id;
                });
                if (isIt == -1) {
                  return false;
                } else {
                  return true;
                }
              };
              const theEvent = req.session.organism.events.find(containsActivity);
              console.log('theEvent : ' + theEvent);
              todo.event_name = theEvent.intitule;
              return todo;
            } else {
              return td;
            }
          };
          var lastTodos = todos.map(addEventName);
          res.render('o_dashboard.jade', {
            ev_past: ev_past,
            ev_to_come: ev_to_come,
            organism: req.session.organism,
            todos: lastTodos,
            group: req.session.group
          });
        }
      });
    }
  })
});

router.get('/organism/event/:event_id', permissions.requireGroup('organism', 'admin'), function(req, res) {
  function isEvent(event) {
    console.log('Test : ' + event._id + ' = ' + req.params.event_id + ' ?');
    return event._id === req.params.event_id;
  };
  var event = req.session.organism.events.find(isEvent);
  var acts_id = event.activities;
  Activity.find({
    "_id": {
      '$in': acts_id
    }
  }, function(err, activities) {
    if (err) {
      console.log(err);
      res.redirect('/organism/dashboard?error=' + err);
    } else {
      Volunteer.find({
        "events": {
          '$elemMatch': {
            'activity_id': {
              '$in': acts_id
            }
          }
        }
      }, function(err, volunteers) {
        if (err) {
          console.log(err);
          res.redirect('/organism/dashboard?error=' + err);
        } else {
          var activities_list = activities;
          console.log('ALL ACTIVITIES : ' + activities_list);
          console.log('****************************');
          console.log('ALL VOLUNTEERS : ' + volunteers);
          console.log('****************************');
          event.acts = [];
          for (var actI = activities_list.length - 1; actI >= 0; actI--) {
            for (var daysI = activities_list[actI].days.length - 1; daysI >= 0; daysI--) {
              activities_list[actI].days[daysI].vols = [];
              var vols = [];
              console.log('activities_list[actI] : ' + activities_list[actI].days[daysI]);
              console.log('**************');

              function goodEvent(event) {
                console.log('blop');
                console.log('event.activity_id : ' + event.activity_id.toString());
                console.log('activities_list[actI]._id : ' + activities_list[actI]._id.toString());
                console.log('event.activity_id === activities_list[actI]._id : ' + (event.activity_id.toString() === activities_list[actI]._id.toString()));
                return ((event.activity_id.toString() === activities_list[actI]._id.toString()) && (Date.parse(event.day) === Date.parse(activities_list[actI].days[daysI].day)));
              };

              function isParticipating(volunteer) {
                console.log('volunteer.events : ' + volunteer.events);
                var result = volunteer.events.find(goodEvent);
                console.log('result : ' + result);
                return typeof result !== 'undefined';
              };
              var these_volunteers = volunteers.filter(isParticipating);
              console.log('these_volunteers : ' + these_volunteers);


              Array.prototype.push.apply(activities_list[actI].days[daysI].vols, these_volunteers);
              console.log('activities_list[actI] avec vols : ' + activities_list[actI]);
              console.log('activities_list[actI].vols : ' + activities_list[actI].days[daysI].vols);
            }
          };


          Array.prototype.push.apply(event.acts, activities_list);
          console.log('activities_list : ' + event.acts[0]);
          console.log('activities_list : ' + event.acts[0].lat);
          console.log('activities_list : ' + event.acts[0].min_hours);
          console.log('activities_list : ' + event.acts[0].days);
          console.log('activities_list : ' + event.acts[0].days[0].vols);
          //res.json(event);
          res.render('o_event.jade', {
            event: event,
            organism: req.session.organism,
            group: req.session.group
          });
        }
      });
    }
  });
});


router.get('/organism/longterm/:lt_id', permissions.requireGroup('organism', 'admin'), function(req, res) {
  console.log('In GET to a longterm page with lt_id:' + req.params.lt_id);
  var organism = req.session.organism;

  function isRightLongterm(long) {
    console.log('long._id == req.params.lt_id : ' + (long._id == req.params.lt_id) + long._id + '  ' + req.params.lt_id)
    return long._id == req.params.lt_id;
  };
  var longterm = organism.long_terms.find(isRightLongterm);
  console.log('+++++++++++++++++++++');
  console.log('Longterm corresponding to lt_id : ' + longterm)
  console.log('+++++++++++++++++++++');
  Volunteer.find({
    "long_terms": {
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
    'birthdate': 1
  }, function(err, volunteers) {
    if (err) {
      console.log(err);
      res.redirect('/organism/dashboard?error=' + err);
    } else {
      var slotJSON = rewindSlotString(longterm.slot);
      res.render('o_longterm.jade', {
        lt_id: req.params.lt_id,
        organism: organism,
        longterm: longterm,
        slotJSON: slotJSON,
        volunteers: volunteers,
        group: req.session.group
      });
      res.end();
    };
  });

});


router.post('/organism/correcthours', permissions.requireGroup('organism', 'admin'), function(req, res) {
  console.log('Correct Hours starts');
  const correct_hours = req.body.correct_hours;
  console.log('Correct_hours: ' + correct_hours);
  OrgTodo.findOneAndRemove({
    _id: req.body.todo
  }, function(err, todoremoved) {
    if (err) {
      console.log(err);
    } else {
      console.log('todoremoved : ' + todoremoved);
    }
  });
  Volunteer.findOne({
    _id: req.body.vol_id
  }, function(err, myVolunteer) {
    if (err) {
      console.log(err);
      res.sendStatus(404).end();
    } else if (myVolunteer) {
      console.log('myvolunteer exists');
      console.log('MyVolunteer : ' + JSON.stringify(myVolunteer));
      if (typeof req.body.act_id !== 'undefined') {
        console.log('Correct hours for an activity !');
        var query = {
          '_id': req.body.vol_id,
          'events': {
            '$elemMatch': {
              'activity_id': req.body.act_id,
              'day': req.body.day
            }
          }
        };
        if (req.body["answers[0][value]"]) {
          console.log("req.body.answers[0][value] : " + req.body["answers[0][value]"]);
          //i starts from 1 to avoid to select the number answered as corrected hours
          var i = 1;
          var answers = [];
          while (req.body["answers[" + i + "][value]"]) {
            console.log('Add to answers : ' + req.body["answers[" + i + "][value]"]);
            answers.push(req.body["answers[" + i + "][value]"]);
            i++;
          };
          console.log('Answers : ' + JSON.stringify(answers));
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
              'events.$.status': 'confirmed'
            }
          };
        };
      } else if (typeof req.body.lt_id !== 'undefined') {
        console.log('Correct hours for a longterm !');
        var query = {
          '_id': req.body.vol_id,
          'long_terms': {
            '$elemMatch': {
              '_id': req.body.lt_id
            }
          }
        };
        if (req.body["answers[0][value]"]) {
          console.log("req.body.answers[0][value] : " + req.body["answers[0][value]"]);
          //i starts from 1 to avoid to select the number answered as corrected hours
          var i = 1;
          var answers = [];
          while (req.body["answers[" + i + "][value]"]) {
            console.log('Add to answers : ' + req.body["answers[" + i + "][value]"]);
            answers.push(req.body["answers[" + i + "][value]"]);
            i++;
          };
          console.log('Answers : ' + JSON.stringify(answers));
          var update = {
            '$inc': {
              'long_terms.$.hours_done': correct_hours,
              'long_terms.$.hours_pending': -req.body.hours_before
            },
            '$set': {
              'long_terms.$.status': 'confirmed',
              'long_terms.$.organism_answers': answers
            }
          };
        } else {
          var update = {
            '$inc': {
              'long_terms.$.hours_done': correct_hours,
              'long_terms.$.hours_pending': -req.body.hours_before
            },
            '$set': {
              'long_terms.$.status': 'confirmed'
            }
          };
        };
      };
      console.log('query : ' + JSON.stringify(query));
      console.log('update : ' + JSON.stringify(update));
      Volunteer.findOneAndUpdate(query, update, function(err) {
        if (err) {
          console.log(err);
          res.sendStatus(404).end();
        } else {
          console.log('Hours_pending goes to hours_done with corrected_hours : ' + req.body.correct_hours);
          res.sendStatus(200).end();
        }
      });
    } else {
      console.log('MyVolunteer doesnt exist');
      res.sendStatus(404).end();
    };
  });
});

router.post('/organism/confirmhours', permissions.requireGroup('organism', 'admin'), function(req, res) {
  console.log('Confirm Hours starts');
  OrgTodo.findOneAndRemove({
    _id: req.body.todo
  }, function(err, todoremoved) {
    if (err) {
      console.log(err);
    } else {
      console.log('todoremoved : ' + todoremoved);
    }
  });
  Volunteer.findOne({
    _id: req.body.vol_id
  }, function(err, myVolunteer) {
    if (err) {
      console.log(err);
      res.redirect('/organism/dashboard?error=' + err);
    } else if (myVolunteer) {
      console.log('myvolunteer exists');
      console.log('MyVolunteer : ' + JSON.stringify(myVolunteer.email));
      var hours_pending = req.body.hours;
      console.log('hours_pending : ' + hours_pending);
      console.log('JSON.stringify(req.body) : ' + JSON.stringify(req.body));
      var update = {};
      //If we deal with an event
      if (req.body.act_id) {
        var query = {
          '_id': req.body.vol_id,
          'events': {
            '$elemMatch': {
              'activity_id': req.body.act_id,
              'day': req.body.day
            }
          }
        };
        //If we deal with a student
        if (req.body["answers[0][value]"]) {
          console.log("req.body.answers[0][value] : " + req.body["answers[0][value]"]);
          var i = 0;
          var answers = [];
          while (req.body["answers[" + i + "][value]"]) {
            console.log('Add to answers : ' + req.body["answers[" + i + "][value]"]);
            answers.push(req.body["answers[" + i + "][value]"]);
            i++;
          };
          console.log('Answers : ' + JSON.stringify(answers));
          var update = {
            '$set': {
              'events.$.hours_done': hours_pending,
              'events.$.hours_pending': 0,
              'events.$.status': 'confirmed',
              'events.$.organism_answers': answers
            }
          };
        } else {
          console.log("NO answers");
          var update = {
            '$set': {
              'events.$.hours_done': hours_pending,
              'events.$.hours_pending': 0,
              'events.$.status': 'confirmed'
            }
          };
        };
        //If we deal with a longterm
      } else if (req.body.lt_id) {
        var query = {
          '_id': req.body.vol_id,
          'long_terms': {
            '$elemMatch': {
              '_id': req.body.lt_id
            }
          }
        };
        //If we deal with a student
        if (req.body["answers[0][value]"]) {
          console.log("req.body.answers[0][value] : " + req.body["answers[0][value]"]);
          var i = 0;
          var answers = [];
          while (req.body["answers[" + i + "][value]"]) {
            console.log('Add to answers : ' + req.body["answers[" + i + "][value]"]);
            answers.push(req.body["answers[" + i + "][value]"]);
            i++;
          };
          console.log('Answers : ' + JSON.stringify(answers));
          var update = {
            '$inc': {
              'long_terms.$.hours_done': hours_pending,
              'long_terms.$.hours_pending': -hours_pending
            },
            '$set': {
              'long_terms.$.status': 'confirmed',
              'long_terms.$.organism_answers': answers
            }
          };
        } else {
          console.log("NO answers");
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
      }

      Volunteer.findOneAndUpdate(query, update, function(err) {
        if (err) {
          console.log(err);
          res.sendStatus(404).end();
        } else {
          console.log('Hours_pending goes to hours_done : ' + hours_pending);
          console.log(req.body);
          res.sendStatus(200).end();
        }
      });
    } else {
      console.log('MyVolunteer doesnt exist');
      res.sendStatus(404).end();
    };
  });
});

router.get(/dashboard/, permissions.requireGroup('organism', 'admin'), function(req, res) {
  res.redirect('/dashboard');
});

module.exports = router;