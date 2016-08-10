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
  Activity.find({"org_id": req.session.organism.org_id}, function(err, activities){
    if (err){
      console.log(err);
      res.render('g_accueil.jade', {
        session: req.session,
        error: err
      });
    }
    else {
      res.render('o_dashboard.jade', {events: req.session.organism.events, activities: activities, organism: req.isAuthenticated()});
    }
  })
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
//++++++++++++++++++++++++++++++++++++++++