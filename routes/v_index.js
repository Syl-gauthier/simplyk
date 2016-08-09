/*jslint node: true */

var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Organism = require('../models/organism_model.js');
var Volunteer = require('../models/volunteer_model.js');

var permissions = require('../middlewares/permissions.js');
var subscribe = require('../middlewares/subscribe.js');
var finder = require('../middlewares/mongo_finder.js');
var app = express();

/*GET map page*/
router.get('/volunteer/map', permissions.requireGroup('volunteer'), function(req, res) {
  Organism.find({}, 'events id org_name', function(err, organisms){
    if (err) {
      console.log(err);
      res.render('v_map.jade', {
        session: req.session,
        error: err
      });
    }
    //Create opps list
    else {
      console.log(req.isAuthenticated());
      console.log('**************');
      var activitiesList = [];
      //Add org_name and event details in the activities and create the list of all the activities
      for (var orgI = organisms.length - 1; orgI >= 0; orgI--) {
        for (var eventI = organisms[orgI].events.length - 1; eventI >= 0; eventI--) {
          for (var activityI = organisms[orgI].events[eventI].activities.length - 1; activityI >= 0; activityI--) {
            var activity = {
              intitule: organisms[orgI].events[eventI].activities[activityI].intitule,
              description: organisms[orgI].events[eventI].activities[activityI].description,
              min_hours: organisms[orgI].events[eventI].activities[activityI].min_hours,
              days: organisms[orgI].events[eventI].activities[activityI].days,
              org_id: organisms[orgI]._id,
              event_intitule: organisms[orgI].events[eventI].intitule,
              event_lat: organisms[orgI].events[eventI].lat,
              event_lon: organisms[orgI].events[eventI].lon,
              event_address: organisms[orgI].events[eventI].address,
              org_name: organisms[orgI].org_name,
              id: organisms[orgI].events[eventI].activities[activityI]._id
            };
            activitiesList.push(activity);
          }
        }
      }
      console.log('**************');
      console.log('activitiesList : '+JSON.stringify(activitiesList));
      console.log('**************');
      res.render('v_map.jade', {
        activities: activitiesList,
        volunteer: req.isAuthenticated(), error: req.query.error
      });
    }
  });
});

router.get('/activity/:act_id', permissions.requireGroup('volunteer'), function(req,res){
  console.log('In GET to an activity page with act_id:' + req.params.act_id);
  //Find organism corresponding to the activity
  Organism.find({
    "events": {
      "$elemMatch": {
        "activities": {
          "$elemMatch": {
            "_id": req.params.act_id
          }
        }
      }
    }
  }, function(err, organism){
    if (err) {
      console.log(err);
      res.render('v_map.jade', {
        session: req.session,
        error: err
      });
    }
    else {
      //Find event and activity from organisms infos
      var finder_results = finder.getActivityAndEvent(organism[0], req.params.act_id);
      console.log('Organism[0] : ' + organism[0]);
      res.render('g_activity_page.jade', {act_id: req.params.act_id, organism: organism[0], event: finder_results.event, activity: finder_results.activity, activity_index: finder_results.activity_index, volunteer: req.session.volunteer});
      res.end();
    }
  });
});

router.post('/volunteer/subscribe/:act_id-:day_index-:activity_index-:activity_day', permissions.requireGroup('volunteer'), function(req, res) {
  //Verify the volunteer is not already susbscribed to the activity
  
  function isActivity(activity){
    console.log('Activity day : + ' + Date.parse(activity.day) + Date.parse(req.params.activity_day))
    return ((activity.activity_id.toString() === req.params.act_id) && (Date.parse(activity.day) === Date.parse(req.params.activity_day)));
  }
  var alreadyExists = req.session.volunteer.events.find(isActivity);
  console.log('alreadyExists : ' + alreadyExists + typeof alreadyExists);
  if(typeof alreadyExists === 'undefined'){
    //Update organism in Mongo
    var applicationToAdd = {
      applicant_id: req.session.volunteer._id,
      applicant_name: req.session.volunteer.lastname
    };
    var path = 'events.$.activities.'+req.params.activity_index+'.days.'+ req.params.day_index+'.applications';
    var pathQuery = {};
    pathQuery[path]=applicationToAdd;
    var setQuery = {};
    setQuery["$addToSet"]= pathQuery;
    console.log('Final set query' + JSON.stringify(setQuery));
    console.log('Act_id which is searched : ' + req.params.act_id);
    Organism.findOneAndUpdate({
      "events": {
        "$elemMatch": {
          "activities": {
            "$elemMatch": {
              "_id": req.params.act_id
            }
          }
        }
      }
    },
    setQuery, {returnNewDocument : true}, function(err, newOrganism){
      if (err){
        console.log(err);
      }
      else{
        console.log('**********************************');
        console.log('New Organism modified : ' + JSON.stringify(newOrganism));
        console.log('**********************************');


        //Update volunteer in Mongo
        var finder_results = finder.getActivityAndEvent(newOrganism, req.params.act_id);
        Volunteer.findOneAndUpdate({
          "_id":req.session.volunteer._id
        },
        {
          "$addToSet": {
            "events": {
              "activity_id": req.params.act_id,
              "intitule": finder_results.event.intitule,
              "address": finder_results.event.address,
              "lat": finder_results.event.lat,
              "lon": finder_results.event.lon,
              "day": finder_results.activity.days[req.params.day_index].day,
              "description_event": finder_results.event.description,
              "description_activity": finder_results.activity.description,
              "org_id": newOrganism._id,
              "org_name": newOrganism.org_name,
              "start_time": finder_results.activity.days[req.params.day_index].start_time,
              "end_time": finder_results.activity.days[req.params.day_index].end_time,
              "hours_done": 0,
              "status": 'subscribed',
              "hours_pending": 0
            }
          }
        }, {returnNewDocument : true, new: true}, function(err, newVolunteer){
          if (err){
            console.log(err);
          }
          else {
            console.log('**********************************');
            console.log('New Volunteer modified : ' + JSON.stringify(newVolunteer));
            console.log('**********************************');
            //UPDATING REQ.SESSION.VOLUNTEER
            req.session.volunteer = newVolunteer;
            res.redirect('/volunteer/map');
            res.end();
          }
        })
      }
    });
  }
  else{
    console.log('Already subscribed to this event');
    var error = encodeURIComponent('Vous êtes déjà inscrit à cette activité !');
    res.redirect('/volunteer/map?error='+error);
    res.end();
  }
});

//POST to an activity page ===== require act_id
/*router.post('/activity/:act_id', permissions.requireGroup('volunteer'), function(req,res){
  console.log('In POST to an activity page with act_id:' + req.params.act_id);
  //Find organism corresponding to the activity
  Organism.find({
    "events": {
      "$elemMatch": {
        "activities": {
          "$elemMatch": {
            "_id": req.params.act_id
          }
        }
      }
    }
  }, function(err, organism){
    if (err) {
      console.log(err);
      res.render('v_map.jade', {
        session: req.session,
        error: err
      });
    }
    else {
      //Find event and activity from organisms infos
      var finder_results = finder.getActivityAndEvent(organism[0], req.params.act_id);
      console.log('Organism[0] : ' + organism[0]);
      res.render('g_activity_page.jade', {act_id: req.params.act_id, organism: organism[0], event: finder_results.event, activity: finder_results.activity, activity_index: finder_results.activity_index, volunteer: req.session.volunteer});
      res.end();
    }
  });
});

router.post('/volunteer/subscribe/:act_id-:day_index-:activity_index', permissions.requireGroup('volunteer'), function(req, res) {
  //Verify the volunteer is not already susbscribed to the activity
  
  function isActivity(activity){
    return activity.activity_id.toString() === req.params.act_id;
  }
  var alreadyExists = req.session.volunteer.events.find(isActivity);
  console.log('alreadyExists : ' + alreadyExists + typeof alreadyExists);
  if(typeof alreadyExists === 'undefined'){
    //Update organism in Mongo
    var applicationToAdd = {
      applicant_id: req.session.volunteer._id,
      applicant_name: req.session.volunteer.lastname
    };
    var path = 'events.$.activities.'+req.params.activity_index+'.days.'+ req.params.day_index+'.applications';
    var pathQuery = {};
    pathQuery[path]=applicationToAdd;
    var setQuery = {};
    setQuery["$addToSet"]= pathQuery;
    console.log('Final set query' + JSON.stringify(setQuery));
    console.log('Act_id which is searched : ' + req.params.act_id);
    Organism.findOneAndUpdate({
      "events": {
        "$elemMatch": {
          "activities": {
            "$elemMatch": {
              "_id": req.params.act_id
            }
          }
        }
      }
    },
    setQuery, {returnNewDocument : true}, function(err, newOrganism){
      if (err){
        console.log(err);
      }
      else{
        console.log('**********************************');
        console.log('New Organism modified : ' + JSON.stringify(newOrganism));
        console.log('**********************************');


        //Update volunteer in Mongo
        var finder_results = finder.getActivityAndEvent(newOrganism, req.params.act_id);
        Volunteer.findOneAndUpdate({
          "_id":req.session.volunteer._id
        },
        {
          "$addToSet": {
            "events": {
              "activity_id": req.params.act_id,
              "intitule": finder_results.event.intitule,
              "address": finder_results.event.address,
              "lat": finder_results.event.lat,
              "lon": finder_results.event.lon,
              "day": finder_results.activity.days[req.params.day_index].day,
              "description_event": finder_results.event.description,
              "description_activity": finder_results.activity.description,
              "org_id": newOrganism._id,
              "org_name": newOrganism.org_name,
              "start_time": finder_results.activity.days[req.params.day_index].start_time,
              "end_time": finder_results.activity.days[req.params.day_index].end_time,
              "hours_done": 0,
              "status": 'subscribed',
              "hours_pending": 0
            }
          }
        }, {returnNewDocument : true, new: true}, function(err, newVolunteer){
          if (err){
            console.log(err);
          }
          else {
            console.log('**********************************');
            console.log('New Volunteer modified : ' + JSON.stringify(newVolunteer));
            console.log('**********************************');
            //UPDATING REQ.SESSION.VOLUNTEER
            req.session.volunteer = newVolunteer;
            res.redirect('/volunteer/map');
            res.end();
          }
        })
      }
    });
  }
  else{
    console.log('Already subscribed to this event');
    var error = 'Vous êtes déjà inscrit à cette activité !'
    res.redirect('/activity/'+req.params.act_id, {error: error});
    res.end();
  }
});*/
//subscribe.subscribeUserToAct(req, res);

router.post('/volunteer/unsubscribe', permissions.requireGroup('volunteer'), function(req, res) {
  subscribe.unsubscribeUserToAct(req, res);
});

router.get('/user', function(req, res){
  res.json(req.session.volunteer);
});


router.post('/volunteer/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
