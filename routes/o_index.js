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
  Activity.find({}, function(err, activities){
    if(err){
      console.log(err);
      res.render('g_accueil.jade', {
        session: req.session,
        error: err
      });
    }
    //Create events list
    else {
      console.log(req.isAuthenticated());
      console.log('**************');
      res.render('g_accueil.jade', {activities: activities, session: req.session});
    }
  });
});

router.get('/organism/dashboard', permissions.requireGroup('organism'), function(req, res){
  Activity.find({"org_id": req.session.organism._id}, function(err, activities){
    if (err){
      console.log(err);
      res.render('g_accueil.jade', {
        session: req.session,
        error: err
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
      console.log('Activity days : ' + ev_to_come[0].acts[0].lat);
      console.log('Activity days : ' + ev_to_come[0].acts[0].lon);
      console.log('Activity days : ' + ev_to_come[0].acts[0].intitule);
      console.log('ev_past : ' + ev_past +' ev_to_come :'+ JSON.stringify(ev_to_come));
      res.render('o_dashboard.jade', {ev_past: ev_past, ev_to_come: ev_to_come, organism: req.isAuthenticated()});
    }
  })
});

router.get('/organism/event/:event_id', function(req,res){
  function isEvent(event){
    return event._id === req.params.event_id;
  };
  var event = req.session.organism.events.find(isEvent);
  var acts_id = event.activities;
  console.log('event.activities.length : ' + event.activities.length);
  Activity.find({"id": {'$in': acts_id}}, function(err, activities){
    if (err){
      console.log(err);
      res.redirect('/organism/dashboard?error='+err);
    }
    else{
      function inThisEvent(activity){
        return (events[eventI].activities.indexOf(activity._id.toString()) >= 0);
      };
      var event = req.session.organism.events.filter(isTheEvent);
      event.acts = activities;
      res.json(event);
      //res.render('o_event.jade', {event: event});
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

router.post('/organism/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;