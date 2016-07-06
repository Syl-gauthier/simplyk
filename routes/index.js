var express = require('express');
var router = express.Router();
var passport = require('passport')
var jade = require('jade');

var GoogleMapsAPI = require('googlemaps');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var permissions = require('../middlewares/permissions.js');
var Opp = require('../models/opp_model.js');
var User = require('../models/user_model.js');
var Organism = require('../models/organism_model.js');

var app = express();

/* GET home page. */
router.get('/', function(req, res, next) {
  Opp.find({}, function(err, opps){
    if(err){
      console.log(err);
      res.render('accueil.jade', {session: req.session, error: err});
    }
    //Create opps list
    else{
      res.render('accueil.jade', {opps: opps, session: req.session, user: req.user});
    }
  });
});

router.get('/dashboard', permissions.requireGroup('organism'), 
  function(req, res){
  Opp.find({oName: req.user.orgName}, function(err, opps){
    res.render('dashboard.jade', {opps: opps,
      user: req.isAuthenticated()});
  });
});

//for ajax call only (for now)
//Get users info from an opp intitule
router.post('/getOppUsers', function(req, res){
  console.log("opp_id: " + req.body.opp_id);

  Opp.findById(req.body.opp_id).populate("applications.applicant").exec(function(err, opp){
    if(err){
      console.log(err);
      res.write(err);
      res.end();
    }
    else{
      console.log(opp.toString());
      res.render('applicants.jade', {applications: opp.applications});
    }
  });
});

module.exports = router;
