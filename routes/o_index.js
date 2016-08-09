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

var app = express();

var opp_management = require('../middlewares/opp_management.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  Organism.find({}, 'events id org_name', function(err, organisms){
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
      res.render('g_accueil.jade', {activities: activitiesList, session: req.session});
    }
  });
});


router.get('/organism/dashboard', permissions.requireGroup('organism'), function(req, res){
  res.render('o_dashboard.jade', {events: req.session.organism.events, organism: req.isAuthenticated()});
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
