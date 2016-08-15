var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var emailer = require('../email/emailer.js')

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Organism = require('../models/organism_model.js');
var Volunteer = require('../models/volunteer_model.js');
var Activity = require('../models/activity_model.js');

var permissions = require('../middlewares/permissions.js');
var subscribe = require('../middlewares/subscribe.js');
var finder = require('../middlewares/mongo_finder.js');
var app = express();

/*GET map page*/
router.get('/volunteer/map', permissions.requireGroup('volunteer'), function(req, res) {
  Activity.find({}, function(err, activities){
    if (err) {
      console.log(err);
      res.render('v_map.jade', {
        session: req.session,
        error: err,
        volunteer: req.isAuthenticated()
      });
    }
    //Create opps list
    else {
      console.log(req.isAuthenticated());
      console.log('**************');
      console.log('activitiesList : '+JSON.stringify(activities));
      console.log('**************');
      res.render('v_map.jade', {
        activities: activities,
        volunteer: req.isAuthenticated(), error: req.query.error, success: req.query.success
      });
    }
  });
});


router.get('/activity/:act_id', permissions.requireGroup('volunteer'), function(req,res){
  console.log('In GET to an activity page with act_id:' + req.params.act_id);
  //Find organism corresponding to the activity
  Activity.findById(req.params.act_id, function(err, activity){
    Organism.find({
      "events.activities": req.params.act_id
    }, function(err, organism){
      if (err) {
        console.log(err);
        res.redirect('/volunteer/map?error='+err);
      }
      else {
        console.log('Organism : ' + organism);
        console.log('Organism[0] : ' + organism[0]);
        console.log('Organism.events : ' + organism[0].events);
        function isRightEvent(event){
          return event.activities.indexOf(req.params.act_id) >= 0;
        };
        var event_filtered = organism[0].events.filter(isRightEvent);
        console.log('+++++++++++++++++++++');
        console.log('Event find in organism corresponding to act : ' + event_filtered)
        console.log('+++++++++++++++++++++');
        console.log('Activity : ' + activity);
        res.render('g_activity_page.jade', {act_id: req.params.act_id, event: event_filtered, organism: organism[0], activity: activity, volunteer: req.isAuthenticated()});
        res.end();
      }
    });
  });
});


router.post('/volunteer/subscribe/:act_id-:activity_day', permissions.requireGroup('volunteer'), function(req, res) {
  //Verify the volunteer is not already susbscribed to the activity
  
  function isActivity(activity){
    console.log('Activity day : + ' + Date.parse(activity.day) + Date.parse(req.params.activity_day))
    return ((activity.activity_id.toString() === req.params.act_id) && (Date.parse(activity.day) === Date.parse(req.params.activity_day)));
  };
  var alreadyExists = req.session.volunteer.events.find(isActivity);
  console.log('alreadyExists : ' + alreadyExists + typeof alreadyExists);
  if(typeof alreadyExists === 'undefined'){
    console.log('Act_id which is searched : ' + req.params.act_id);
    console.log('MODIFYING ACTIVITY');
    Activity.findOneAndUpdate({
      "$and": [{
        "_id": req.params.act_id
      },{
        "days.day": req.params.activity_day
      }]
    },{
      "$addToSet": {
        "days.$.applicants": req.session.volunteer._id
      }
    }, function(err, newActivity){
      if(err){
        console.log(err);
      }
      else{
        function isGoodDay(day){
          return (Date.parse(day.day) === Date.parse(req.params.activity_day));
        };
        console.log('Isgood day result : ' + newActivity.days.find(isGoodDay));
        Volunteer.findOneAndUpdate({
          "_id":req.session.volunteer._id
        },
        {
          "$addToSet": {
            "events": {
              "activity_id": req.params.act_id,
              "intitule": newActivity.event_intitule,
              "address": newActivity.activity,
              "lat": newActivity.lat,
              "lon": newActivity.lon,
              "day": req.params.activity_day,
              "intitule_activity": newActivity.description,
              "org_id": newActivity.org_id,
              "org_name": newActivity.org_name,
              "start_time": newActivity.days.find(isGoodDay).start_time,
              "end_time": newActivity.days.find(isGoodDay).end_time,
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
            var success =  encodeURIComponent('Vous avez été inscrit à l\'activité avec succès !');
            Organism.findById(newActivity.org_id, function(err, organism){
              var content = {
                recipient: organism.email,
                name: organism.firstname + ' ' + organism.lastname,
                customMessage: req.session.volunteer.firstname + ' s\'est inscrit à votre activité ' + newActivity.intitule + ' de l\'évènement ' + newActivity.event_intitule + ' !'
              };
              emailer.sendSubscriptionEmail(content);
            });
            res.redirect('/volunteer/map?success='+success);
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

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 

module.exports = router;