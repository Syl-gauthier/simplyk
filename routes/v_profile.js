var express = require('express');
var router = express.Router();
var emailer = require('../email/emailer.js');


var permissions = require('../middlewares/permissions.js');
var Volunteer = require('../models/volunteer_model.js');
var Organism = require('../models/organism_model.js');
var Activity = require('../models/activity_model.js');
var OrgTodo = require('../models/o_todo_model.js');



router.get('/volunteer/profile', permissions.requireGroup('volunteer'), function(req, res) {
  console.log('Begin get /profile')
  console.log(req.session.volunteer);
  var events_past = [];
  var events_pending = [];
  var events_subscribed = [];
  var events_confirmed = [];
  var error;
  for (var eventI = req.session.volunteer.events.length - 1; eventI >= 0; eventI--) {
    if (Date.parse(req.session.volunteer.events[eventI].day) < Date.now() && req.session.volunteer.events[eventI].status === 'subscribed') {
      events_past.push(req.session.volunteer.events[eventI]);
    } else if (Date.parse(req.session.volunteer.events[eventI].day) > Date.now()) {
      req.session.volunteer.events[eventI].status = 'subscribed';
      events_subscribed.push(req.session.volunteer.events[eventI]);
    } else if (Date.parse(req.session.volunteer.events[eventI].day) < Date.now() && req.session.volunteer.events[eventI].status === 'pending') {
      events_pending.push(req.session.volunteer.events[eventI]);
    } else if (Date.parse(req.session.volunteer.events[eventI].day) < Date.now() && req.session.volunteer.events[eventI].status === 'confirmed') {
      events_confirmed.push(req.session.volunteer.events[eventI]);
    } else {
      error = 'Une erreur avec vos inscriptions';
      console.log(error);
    }
  }
  res.render('v_profile.jade', {
    events_subscribed: events_subscribed,
    events_confirmed: events_confirmed,
    events_pending: events_pending,
    events_past: events_past,
    volunteer: req.session.volunteer,
    error: error
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
            /*,
                      "applicants": {
                        "$elemMatch": {
                          "$eq": req.session.volunteer._id
                        }
                      }*/
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
            name: newActivity.org_name,
            customMessage: req.session.volunteer.firstname + ' s\'est désinscrit de votre activité ' + newActivity.intitule + ' de l\'évènement ' + newActivity.event_intitule + ' !'
          };
          emailer.sendUnsubscriptionEmail(content);
          const dayString = new Date(req.params.day).toLocaleDateString();
          console.log('newVolunteer after unsubscription process : ' + newVolunteer);
          res.render('v_postunsubscription.jade', {
            org_name: newActivity.org_name,
            day: dayString,
            volunteer: req.session.volunteer
          });
        }
      })
    }
  });
});

//Add hours_pending to an activity
router.post('/volunteer/hours_pending/:act_id-:day', permissions.requireGroup('volunteer'), function(req, res) {
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
      console.log('newVolunteer ' + newVolunteer);

      function isActivity(event) {
        console.log('isActivity : ' + (event.activity_id == req.params.act_id));
        return event.activity_id == req.params.act_id;
      };

      function isDay(event) {
        console.log('isDay ' + (event.day == req.params.day));
        console.log('Date.parse(event.day) ' + Date.parse(event.day));
        console.log('Date.parse(req.params.day) ' + Date.parse(req.params.day));
        return Date.parse(event.day) == Date.parse(req.params.day);
      };
      const event = newVolunteer.events.filter(isActivity).find(isDay);
      console.log(event);
      if (newVolunteer.student) {
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
      //TODO creation

      newTodo.save(function(err, todo) {
        if (err) {
          console.log(err);
          res.redirect('/volunteer/map?error=' + err);
        } else {
          if (req.session.volunteer.student) {
            res.redirect('/volunteer/student_questions/' + req.params.act_id + '-' + req.params.day);
          } else {
            res.redirect('/volunteer/map');
          }
        }
      })
    }
  });
});


//Add hours_pending to an activity
router.post('/volunteer/LThours_pending/:lt_id', permissions.requireGroup('volunteer'), function(req, res) {
  console.log('JSON.stringify(req.body) : ' + JSON.stringify(req.body));
  console.log('JSON.stringify(req.params) : ' + JSON.stringify(req.params));

  function isLongTerm(longterm) {
    console.log('isLongTerm : ' + (longterm._id == req.params.lt_id));
    return longterm._id == req.params.lt_id;
  };
  const lt = req.session.volunteer.long_terms.find(isLongTerm);
  console.log('req.session.volunteer : ' + JSON.stringify(req.session.volunteer));
  console.log('lt : ' + JSON.stringify(lt));
  console.log('lt.hours_pending : ' + lt.hours_pending);
  if (lt.hours_pending > 0) {
    console.log('lt.hours_pending is positive');
    var new_hours_pending = parseInt(lt.hours_pending) + parseInt(req.body.hours_pending);
  } else {
    var new_hours_pending = parseInt(req.body.hours_pending);
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
      console.log('newVolunteer ' + newVolunteer);
      const new_lt = newVolunteer.long_terms.find(isLongTerm);
      console.log(new_lt);
      if (newVolunteer.student) {
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
      //TODO creation

      newTodo.save(function(err, todo) {
        if (err) {
          console.log(err);
        } else {
          if (req.session.volunteer.student) {
            res.redirect('/volunteer/student_questions/' + req.params.lt_id);
          } else {
            res.redirect('/volunteer/map');
          }
        }
      })
    }
  });
});


router.get('/volunteer/event/:act_id', permissions.requireGroup('volunteer'), function(req, res) {

  //Pour trouver l'event dasn le volunteer
  function isEvent(event) {
    console.log('indexOf : ' + event.activities.indexOf(req.params.act_id) + ' in ' + JSON.stringify(event.activites));
    return event.activities.indexOf(req.params.act_id) > -1;
  };

  Organism.findOne({
    'events': {
      '$elemMatch': {
        'activities': {
          '$in': [req.params.act_id]
        }
      }
    }
  }, function(err, organism) {
    if (err) {
      console.log(err);
      res.redirect('/volunteer/map?error=' + err);
    } else {
      const org = organism;
      const event = organism.events.find(isEvent);
      const activities_in_event_ids = event.activities;
      console.log('activities_in_event_ids' + typeof activities_in_event_ids);
      Activity.find({
        '_id': {
          '$in': activities_in_event_ids
        }
      }, function(err, activities) {
        if (err) {
          console.log(err);
          res.redirect('/volunteer/map?error=' + err);
        } else {
          const acts = activities;
          var isActivity = function(activity) {
            return activity._id == req.params.act_id;
          };
          const activity = acts.find(isActivity);
          var isNotActivity = function(activity) {
            return activity._id != req.params.act_id;
          };
          const other_activities = acts.filter(isNotActivity);
          /*var isSubscribed = function(activity){
            var subscribelist = req.session.volunteer.events.find(function(event){
              return event.activity_id == activity._id;
            });
            if(subscribelist){
              return true;
            }
            else{
              return false;
            }
          }
          const acts_subscribed = acts.filter(isSubscribed)*/
          res.render('v_event.jade', {
            other_activities: other_activities,
            event: event,
            organism: org,
            activity: activity,
            volunteer: req.session.volunteer
          });
        };
      })
    };
  });
});
/*
  Volunteer.find({
    "events":{
      '$elemMatch': {
        'activity_id': {'$in': acts_id}
      }
    }
  }, function(err, volunteers){
    if (err){
      console.log(err);
      res.redirect('/organism/dashboard?error='+err);
    }
    else {
      var activities_list = activities;
      console.log('ALL ACTIVITIES : ' + activities_list);
      console.log('****************************');
      console.log('ALL VOLUNTEERS : ' + volunteers);
      console.log('****************************');
      event.acts =[];
      for (var actI = activities_list.length - 1; actI >= 0; actI--) {
        for (var daysI = activities_list[actI].days.length - 1; daysI >= 0; daysI--) {
          activities_list[actI].days[daysI].vols = [];
          var vols = [];
          console.log('activities_list[actI] : ' + activities_list[actI].days[daysI]);
          console.log('**************');

          function goodEvent(event){
            console.log('blop');
            console.log('event.activity_id : ' + event.activity_id.toString());
            console.log('activities_list[actI]._id : ' + activities_list[actI]._id.toString());
            console.log('event.activity_id === activities_list[actI]._id : ' + (event.activity_id.toString() === activities_list[actI]._id.toString()));
            return ((event.activity_id.toString() === activities_list[actI]._id.toString()) && (Date.parse(event.day) === Date.parse(activities_list[actI].days[daysI].day)));
          };
          function isParticipating(volunteer){
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
          res.render('o_event.jade', {event: event, organism: req.session.organism});
        }
      });
}
});
});*/

module.exports = router;