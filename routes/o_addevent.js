var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var gmaps = require('../middlewares/gmaps.js');

var permissions = require('../middlewares/permissions.js');
var Organism = require('../models/organism_model.js');

router.get('/organism/addevent', permissions.requireGroup('organism'), function(req, res){
  res.render('o_addevent.jade', {organism: req.isAuthenticated()});
});

router.post('/organism/addevent/json', permissions.requireGroup('organism'), function(req, res){
  res.json(req.body);
});

router.post('/organism/addevent', permissions.requireGroup('organism'), function(req,res){
  //Transform address into lon/lat
  console.log('address sent to gmaps: ' + req.body.address)

  gmaps.codeAddress(req.body.address, function(lat, lon){
    Organism.findById(req.session.organism._id, function(err, organism){
      console.log('Organism : ' + organism);
      var event = {
        intitule: req.body.intitule_event,
        dates: [],
        address: req.body.address,
        language: req.body.language,
        description: req.body.event_description,
        status: "to_come",
        activities: [],
        lat: lat,
        lon: lon
      };
      //IT'S AWFULLLLLLL !!!!
      //////AARRRRGGGGGGHHHHH
      if(req.body.activity1_day1=='on'){
        console.log('activity1_day1 exists');
        var activity1_day1 = {
          intitule: req.body.activity1_intitule_activity,
          description: req.body.activity1_activity_description,
          min_hours: req.body.activity1_min_hours,
          start_time: req.body.activity1_day1_startTime,
          end_time: req.body.activity1_day1_endTime,
          day: req.body.day1,
          vol_nb: req.body.activity1_day1_vol_nb,
          applications: []
        };
        event.activities.push(activity1_day1);
      };
      if(req.body.activity1_day2=='on'){
        console.log('activity1_day2 exists');
        var activity1_day2 = {
          intitule: req.body.activity1_intitule_activity,
          description: req.body.activity1_activity_description,
          min_hours: req.body.activity1_min_hours,
          start_time: req.body.activity1_day2_startTime,
          end_time: req.body.activity1_day2_endTime,
          day: req.body.day2,
          vol_nb: req.body.activity1_day2_vol_nb,
          applications: []
        };
        event.activities.push(activity1_day2);
      };
      if(req.body.activity1_day3=='on'){
        console.log('activity1_day3 exists');
        var activity1_day3 = {
          intitule: req.body.activity1_intitule_activity,
          description: req.body.activity1_activity_description,
          min_hours: req.body.activity1_min_hours,
          start_time: req.body.activity1_day3_startTime,
          end_time: req.body.activity1_day3_endTime,
          day: req.body.day3,
          vol_nb: req.body.activity1_day3_vol_nb,
          applications: []
        };
        event.activities.push(activity1_day3);
      };
      if(req.body.activity1_day4=='on'){
        console.log('activity1_day4 exists');
        var activity1_day4 = {
          intitule: req.body.activity1_intitule_activity,
          description: req.body.activity1_activity_description,
          min_hours: req.body.activity1_min_hours,
          start_time: req.body.activity1_day4_startTime,
          end_time: req.body.activity1_day4_endTime,
          day: req.body.day4,
          vol_nb: req.body.activity1_day4_vol_nb,
          applications: []
        };
        event.activities.push(activity1_day4);
      };
      if(req.body.activity1_day5=='on'){
        console.log('activity1_day5 exists');
        var activity1_day5 = {
          intitule: req.body.activity1_intitule_activity,
          description: req.body.activity1_activity_description,
          min_hours: req.body.activity1_min_hours,
          start_time: req.body.activity1_day5_startTime,
          end_time: req.body.activity1_day5_endTime,
          day: req.body.day5,
          vol_nb: req.body.activity1_day5_vol_nb,
          applications: []
        };
        event.activities.push(activity1_day5);
      };
      if(req.body.activity2_day1=='on'){
        console.log('activity2_day1 exists');
        var activity2_day1 = {
          intitule: req.body.activity2_intitule_activity,
          description: req.body.activity2_activity_description,
          min_hours: req.body.activity2_min_hours,
          start_time: req.body.activity2_day1_startTime,
          end_time: req.body.activity2_day1_endTime,
          day: req.body.day1,
          vol_nb: req.body.activity2_day1_vol_nb,
          applications: []
        };
        event.activities.push(activity2_day1);
      };
      if(req.body.activity2_day2=='on'){
        console.log('activity2_day2 exists');
        var activity2_day2 = {
          intitule: req.body.activity2_intitule_activity,
          description: req.body.activity2_activity_description,
          min_hours: req.body.activity2_min_hours,
          start_time: req.body.activity2_day2_startTime,
          end_time: req.body.activity2_day2_endTime,
          day: req.body.day2,
          vol_nb: req.body.activity2_day2_vol_nb,
          applications: []
        };
        event.activities.push(activity2_day2);
      };
      if(req.body.activity2_day3=='on'){
        console.log('activity2_day3 exists');
        var activity2_day3 = {
          intitule: req.body.activity2_intitule_activity,
          description: req.body.activity2_activity_description,
          min_hours: req.body.activity2_min_hours,
          start_time: req.body.activity2_day3_startTime,
          end_time: req.body.activity2_day3_endTime,
          day: req.body.day3,
          vol_nb: req.body.activity2_day3_vol_nb,
          applications: []
        };
        event.activities.push(activity2_day3);
      };
      if(req.body.activity2_day4=='on'){
        console.log('activity2_day4 exists');
        var activity2_day4 = {
          intitule: req.body.activity2_intitule_activity,
          description: req.body.activity2_activity_description,
          min_hours: req.body.activity2_min_hours,
          start_time: req.body.activity2_day4_startTime,
          end_time: req.body.activity2_day4_endTime,
          day: req.body.day4,
          vol_nb: req.body.activity2_day4_vol_nb,
          applications: []
        };
        event.activities.push(activity2_day4);
      };
      if(req.body.activity2_day5=='on'){
        console.log('activity2_day5 exists');
        var activity2_day5 = {
          intitule: req.body.activity2_intitule_activity,
          description: req.body.activity2_activity_description,
          min_hours: req.body.activity2_min_hours,
          start_time: req.body.activity2_day5_startTime,
          end_time: req.body.activity2_day5_endTime,
          day: req.body.day5,
          vol_nb: req.body.activity2_day5_vol_nb,
          applications: []
        };
        event.activities.push(activity2_day5);
      };
      if(req.body.activity3_day1=='on'){
        console.log('activity3_day1 exists');
        var activity3_day1 = {
          intitule: req.body.activity3_intitule_activity,
          description: req.body.activity3_activity_description,
          min_hours: req.body.activity3_min_hours,
          start_time: req.body.activity3_day1_startTime,
          end_time: req.body.activity3_day1_endTime,
          day: req.body.day1,
          vol_nb: req.body.activity3_day1_vol_nb,
          applications: []
        };
        event.activities.push(activity3_day1);
      };
      if(req.body.activity3_day2=='on'){
        console.log('activity3_day2 exists');
        var activity3_day2 = {
          intitule: req.body.activity3_intitule_activity,
          description: req.body.activity3_activity_description,
          min_hours: req.body.activity3_min_hours,
          start_time: req.body.activity3_day2_startTime,
          end_time: req.body.activity3_day2_endTime,
          day: req.body.day2,
          vol_nb: req.body.activity3_day2_vol_nb,
          applications: []
        };
        event.activities.push(activity3_day2);
      };
      if(req.body.activity3_day3=='on'){
        console.log('activity3_day3 exists');
        var activity3_day3 = {
          intitule: req.body.activity3_intitule_activity,
          description: req.body.activity3_activity_description,
          min_hours: req.body.activity3_min_hours,
          start_time: req.body.activity3_day3_startTime,
          end_time: req.body.activity3_day3_endTime,
          day: req.body.day3,
          vol_nb: req.body.activity3_day3_vol_nb,
          applications: []
        };
        event.activities.push(activity3_day3);
      };
      if(req.body.activity3_day4=='on'){
        console.log('activity3_day4 exists');
        var activity3_day4 = {
          intitule: req.body.activity3_intitule_activity,
          description: req.body.activity3_activity_description,
          min_hours: req.body.activity3_min_hours,
          start_time: req.body.activity3_day4_startTime,
          end_time: req.body.activity3_day4_endTime,
          day: req.body.day4,
          vol_nb: req.body.activity3_day4_vol_nb,
          applications: []
        };
        event.activities.push(activity3_day4);
      };
      if(req.body.activity3_day5=='on'){
        console.log('activity3_day5 exists');
        var activity3_day5 = {
          intitule: req.body.activity3_intitule_activity,
          description: req.body.activity3_activity_description,
          min_hours: req.body.activity3_min_hours,
          start_time: req.body.activity3_day5_startTime,
          end_time: req.body.activity3_day5_endTime,
          day: req.body.day5,
          vol_nb: req.body.activity3_day5_vol_nb,
          applications: []
        };
        event.activities.push(activity3_day5);
      };
      if(req.body.activity4_day1=='on'){
        console.log('activity4_day1 exists');
        var activity4_day1 = {
          intitule: req.body.activity4_intitule_activity,
          description: req.body.activity4_activity_description,
          min_hours: req.body.activity4_min_hours,
          start_time: req.body.activity4_day1_startTime,
          end_time: req.body.activity4_day1_endTime,
          day: req.body.day1,
          vol_nb: req.body.activity4_day1_vol_nb,
          applications: []
        };
        event.activities.push(activity4_day1);
      };
      if(req.body.activity4_day2=='on'){
        console.log('activity4_day2 exists');
        var activity4_day2 = {
          intitule: req.body.activity4_intitule_activity,
          description: req.body.activity4_activity_description,
          min_hours: req.body.activity4_min_hours,
          start_time: req.body.activity4_day2_startTime,
          end_time: req.body.activity4_day2_endTime,
          day: req.body.day2,
          vol_nb: req.body.activity4_day2_vol_nb,
          applications: []
        };
        event.activities.push(activity4_day2);
      };
      if(req.body.activity4_day3=='on'){
        console.log('activity4_day3 exists');
        var activity4_day3 = {
          intitule: req.body.activity4_intitule_activity,
          description: req.body.activity4_activity_description,
          min_hours: req.body.activity4_min_hours,
          start_time: req.body.activity4_day3_startTime,
          end_time: req.body.activity4_day3_endTime,
          day: req.body.day3,
          vol_nb: req.body.activity4_day3_vol_nb,
          applications: []
        };
        event.activities.push(activity4_day3);
      };
      if(req.body.activity4_day4=='on'){
        console.log('activity4_day4 exists');
        var activity4_day4 = {
          intitule: req.body.activity4_intitule_activity,
          description: req.body.activity4_activity_description,
          min_hours: req.body.activity4_min_hours,
          start_time: req.body.activity4_day4_startTime,
          end_time: req.body.activity4_day4_endTime,
          day: req.body.day4,
          vol_nb: req.body.activity4_day4_vol_nb,
          applications: []
        };
        event.activities.push(activity4_day4);
      };
      if(req.body.activity4_day5=='on'){
        console.log('activity4_day5 exists');
        var activity4_day5 = {
          intitule: req.body.activity4_intitule_activity,
          description: req.body.activity4_activity_description,
          min_hours: req.body.activity4_min_hours,
          start_time: req.body.activity4_day5_startTime,
          end_time: req.body.activity4_day5_endTime,
          day: req.body.day5,
          vol_nb: req.body.activity4_day5_vol_nb,
          applications: []
        };
        event.activities.push(activity4_day5);
      };
      if(req.body.activity5_day1=='on'){
        console.log('activity5_day1 exists');
        var activity5_day1 = {
          intitule: req.body.activity5_intitule_activity,
          description: req.body.activity5_activity_description,
          min_hours: req.body.activity5_min_hours,
          start_time: req.body.activity5_day1_startTime,
          end_time: req.body.activity5_day1_endTime,
          day: req.body.day1,
          vol_nb: req.body.activity5_day1_vol_nb,
          applications: []
        };
        event.activities.push(activity5_day1);
      };
      if(req.body.activity5_day2=='on'){
        console.log('activity5_day2 exists');
        var activity5_day2 = {
          intitule: req.body.activity5_intitule_activity,
          description: req.body.activity5_activity_description,
          min_hours: req.body.activity5_min_hours,
          start_time: req.body.activity5_day2_startTime,
          end_time: req.body.activity5_day2_endTime,
          day: req.body.day2,
          vol_nb: req.body.activity5_day2_vol_nb,
          applications: []
        };
        event.activities.push(activity5_day2);
      };
      if(req.body.activity5_day3=='on'){
        console.log('activity5_day3 exists');
        var activity5_day3 = {
          intitule: req.body.activity5_intitule_activity,
          description: req.body.activity5_activity_description,
          min_hours: req.body.activity5_min_hours,
          start_time: req.body.activity5_day3_startTime,
          end_time: req.body.activity5_day3_endTime,
          day: req.body.day3,
          vol_nb: req.body.activity5_day3_vol_nb,
          applications: []
        };
        event.activities.push(activity5_day3);
      };
      if(req.body.activity5_day4=='on'){
        console.log('activity5_day4 exists');
        var activity5_day4 = {
          intitule: req.body.activity5_intitule_activity,
          description: req.body.activity5_activity_description,
          min_hours: req.body.activity5_min_hours,
          start_time: req.body.activity5_day4_startTime,
          end_time: req.body.activity5_day4_endTime,
          day: req.body.day4,
          vol_nb: req.body.activity5_day4_vol_nb,
          applications: []
        };
        event.activities.push(activity5_day4);
      };
      if(req.body.activity5_day5=='on'){
        console.log('activity5_day5 exists');
        var activity5_day5 = {
          intitule: req.body.activity5_intitule_activity,
          description: req.body.activity5_activity_description,
          min_hours: req.body.activity5_min_hours,
          start_time: req.body.activity5_day5_startTime,
          end_time: req.body.activity5_day5_endTime,
          day: req.body.day5,
          vol_nb: req.body.activity5_day5_vol_nb,
          applications: []
        };
        event.activities.push(activity5_day5);
      };
      organism.events.push(event);
      organism.save(function(err){
        if(err){
            var error = 'Something bad happened! Try again!';
            res.render('o_addevent.jade', {error: err, organism: req.isAuthenticated()})
        }
        else{
            req.session.organism.events.push(event);
            res.redirect('/organism/dashboard');
        }
      });
    })
  });
});

module.exports = router;
