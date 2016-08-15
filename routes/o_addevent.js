var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var gmaps = require('../middlewares/gmaps.js');

var permissions = require('../middlewares/permissions.js');
var Organism = require('../models/organism_model.js');
var Activity = require('../models/activity_model.js');

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
      console.log('****************************');
      console.log('Organism : ' + organism);
      var keysList = Object.keys(req.body);
      var event = {
        intitule: req.body.intitule_event,
        dates: [],
        address: req.body.address,
        language: req.body.language,
        description: req.body.event_description,
        status: "",
        activities: [],
        lat: lat,
        lon: lon
      };
      //Days number calculated
      var nb_days = 0;
      var days_iterator = -1;
      console.log('Keylist.length : ' + keysList.length + ' and keylist = ' + keysList);
      do{
        nb_days++;
        var days_exists = false;
        for (var d = keysList.length - 1; d >= 0; d--) {
          console.log('Keylist.searchday : '+keysList[d].search('day'+(nb_days+1)));
          if (keysList[d].search('day'+(nb_days+1)) === 0){
            days_exists = true;
            console.log('On est dans le if days');
          }
        };
      }
      while(days_exists);
      console.log('There are ' + nb_days + ' days in the event !');
      //Activities number calculated: nb_activities
      var nb_activities = 0;
      var activities_iterator = -1;
      do{
        nb_activities++;
        var activities_exists = false;
        for (var d = keysList.length - 1; d >= 0; d--) {
          if (keysList[d].search('day'+(nb_activities+1)) === 0){
            activities_exists = true;
            console.log('On est dans le if activities');
          }
        };
      }
      while(activities_exists===true);
      console.log('There are ' + nb_activities + ' activities in the event !');
      //Create activities
      var activitiesList = [];
      for (var i = 1; i<nb_activities+1; i++){
        var activity = {
          lat: lat,
          lon: lon,
          org_id: req.session.organism._id,
          org_name: req.session.organism.org_name,
          event_intitule: req.body.intitule_event,
          address: req.body.address,
          language: req.body.language,
          intitule: req.body['activity'+i+'_intitule_activity'],
          description: req.body['activity'+i+'_activity_description'],
          min_hours: req.body['activity'+i+'_min_hours'],
          days: []
        };
        for (var j = 1; j<nb_days+1; j++){
          if (req.body['activity'+i+'_day'+j] === 'on'){
            var day = {
              start_time: req.body['activity'+i+'_day'+j+'_startTime'],
              end_time: req.body['activity'+i+'_day'+j+'_endTime'],
              vol_nb: req.body['activity'+i+'_day'+j+'_vol_nb'],
              day: req.body['day'+j+'_submit'],
              applications: []
            };
            event.dates.push(day.day);
            activity.days.push(day);
            console.log('3 +++++++  day : ' + j + JSON.stringify(day));
          };
        };
        //Create activity in Mongo
        newActivity = new Activity(activity);
        newActivity.save(function(err, act){
          if(err){
            console.log(err);
          }
          else{
            console.log('++++++++++++++++++++++++++++++');
            console.log('ACT._ID'+act._id);
            event.activities.push(act._id);
            console.log('EVENT.ACTIVITIES : ' + event.activities);
            console.log('++++++++++++++++++++++++++++++');
            console.log('2 ++++++++++ activity : ' + i + JSON.stringify(activity));
            console.log('1 ++++++++ event : ' + JSON.stringify(event));
            organism.events.push(event);
            organism.save(function(err, org){
              if(err){
                var error = 'Something bad happened! Try again!';
                res.render('o_addevent.jade', {error: err, organism: req.isAuthenticated()});
                res.end();
              }
              else{
                function refreshSession(callback){
                  req.session.organism = org;
                  callback();
                };
                refreshSession(function(){
                  res.redirect('/organism/dashboard');
                });
              }
            });
          }
        });
      };
    });
});
});

module.exports = router;