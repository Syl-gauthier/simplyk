/*jslint node: true */

var express = require('express');
var router = express.Router();
var passport = require('passport');
var jade = require('jade');

var GoogleMapsAPI = require('googlemaps');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var permissions = require('../middlewares/permissions.js');
var Volunteer = require('../models/volunteer_model.js');
var Organism = require('../models/organism_model.js');
var Activity = require('../models/activity_model.js');

var app = express();

var opp_management = require('../middlewares/opp_management.js');


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('Organism index');
  Activity.find({}, function(err, activities){
    console.log(activities);
    if(err){
      console.log(err);
      res.render('g_accueil.jade', {
        session: req.session,
        error: err,
        organism: req.session.organism
      });
    }
    //Create events list
    else {
      console.log(req.isAuthenticated());
      console.log('**************');
      if(req.session){
        if(req.session.organism){
          res.redirect('/organism/dashboard');
        }
        else if (req.session.volunteer){
          res.redirect('/volunteer/map');
        }
        else {
          var isNotPassed = function(activity){
          var days_length = activity.days.filter(function(day){
            return day.day > Date.now();
          });
          return days_length.length > 0;
        };
        const acts = activities.filter(isNotPassed);
          res.render('g_accueil.jade', {activities: acts, session: req.session, error: req.query.error});
        };
      }
      else {
        var isNotPassed = function(activity){
          var days_length = activity.days.filter(function(day){
            return day.day > Date.now();
          });
          return days_length.length > 0;
        };
        const actis = activities.filter(isNotPassed);
        res.render('g_accueil.jade', {activities: actis, session: req.session, error: req.query.error});
      }
    };
  });
});

router.get('/organism/dashboard', permissions.requireGroup('organism'), function(req, res){
  console.log('req.body : ' + req.body);
  if(req.body.org){
    req.session.organism = req.body.org;
    console.log('organism refreshed !');
  };
  Activity.find({"org_id": req.session.organism._id}, function(err, activities){
    if (err){
      console.log(err);
      res.render('g_accueil.jade', {
        session: req.session,
        error: err,
        organism: req.isAuthenticated()
      });
    }
    else {
      var events = req.session.organism.events;
      var ev_past = [];
      var ev_to_come = [];
      var error;
      for (var eventI = events.length - 1; eventI >= 0; eventI--) {
        events[eventI].acts = [];
        console.log('******************');
        function inThisEvent(activity){
          return (events[eventI].activities.indexOf(activity._id.toString()) >= 0);
        };
        var these_activities = activities.filter(inThisEvent);
        console.log('In the event ' + events[eventI]._id + 'where activitieslist is :' + events[eventI].activities + ' , the activities are : ' + these_activities)
        Array.prototype.push.apply(events[eventI].acts, these_activities);
        var lastDay = events[eventI].dates[0];
        for (var dateI = events[eventI].dates.length - 1; dateI >= 0; dateI--) {
          if (Date.parse(events[eventI].dates[dateI])>Date.parse(lastDay)){
            lastDay = events[eventI].dates[dateI];
          };
        };
        console.log('LastDay of the event : ' + lastDay);
        if (Date.parse(lastDay)>Date.now()){
          ev_to_come.push(events[eventI]);
        }
        else if(Date.parse(lastDay)<Date.now()){
          ev_past.push(events[eventI]);
        }
      };
      console.log('ev_past : ' + ev_past +' ev_to_come :'+ JSON.stringify(ev_to_come));
      res.render('o_dashboard.jade', {ev_past: ev_past, ev_to_come: ev_to_come, organism: req.session.organism});
    }
  })
});

router.get('/organism/event/:event_id', permissions.requireGroup('organism'), function(req,res){
  function isEvent(event){
    console.log('Test : ' + event._id + ' = ' + req.params.event_id + ' ?');
    return event._id === req.params.event_id;
  };
  var event = req.session.organism.events.find(isEvent);
  var acts_id = event.activities;
  Activity.find({"_id": {'$in': acts_id}}, function(err, activities){
    if (err){
      console.log(err);
      res.redirect('/organism/dashboard?error='+err);
    }
    else{
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
});

//for ajax call only (for now)
//Get users info from an opp intitule
router.post('/organism/getOppUsers', function(req, res) {

  opp_management.getOppUsers(req.body.opp_id, req, res);

});

router.post('/organism/validate',function(req,res){

  opp_management.validate_application(req, res);

});

router.post('/organism/reject',function(req,res){

  opp_management.reject_application(req, res);

});

router.post('/organism/confirmhours', function(req,res){
  console.log('Confirm Hours starts');
  Volunteer.findOne({_id: req.body.vol_id}, function(err, myVolunteer){
    if(err){
      console.log(err);
      res.redirect('/organism/dashboard?error='+err);
    }
    else if(myVolunteer){
      console.log('myvolunteer exists');
      console.log('MyVolunteer : ' + JSON.stringify(myVolunteer));
    }
    else {
      console.log('MyVolunteer doesnt exist');
    }
    function goodEvent(event){
      return (event.activity_id == req.body.act_id) && (Date.parse(event.day) == Date.parse(req.body.day));
    };
    var hours_pending = myVolunteer.events.find(goodEvent).hours_pending;
    console.log('hours_pending : ' + hours_pending)
    Volunteer.findOneAndUpdate({
      '_id': req.body.vol_id,
      'events': {
        '$elemMatch': {
          'activity_id': req.body.act_id,
          'day': req.body.day
        }
      }
    }, {
      '$set': {
        'events.$.hours_done' : hours_pending,
        'events.$.hours_pending' : 0,
        'events.$.status': 'confirmed'
      }
    }, function(err){
      if(err){
        console.log(err);
        res.redirect('/organism/dashboard?error='+err);
      }
      else {
        console.log('Hours_pending goes to hours_done : ' + hours_pending);
        console.log(req.body);
        res.end();
      }
    });
  });
});

router.get(/dashboard/, permissions.requireGroup('organism'), function(req,res){
  res.redirect('/dashboard');
});

router.post(/logout/, function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
