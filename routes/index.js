var express = require('express');
var router = express.Router();
var passport = require('passport')
var mongoose = require('mongoose');
var GoogleMapsAPI = require('googlemaps');
var jade = require('jade');
var LocalStrategy = require('passport-local').Strategy;

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Opp = require('../models/opp_model.js');
var User = require('../models/user_model.js');

var app = express();


/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('accueil.jade');
});

/* GET home page. */

/* Handle Login POST */
router.post('/login', passport.authenticate('login', {
  successRedirect: '/home',
  failureRedirect: '/',
  failureFlash : true 
}));

/* GET Registration Page */
router.get('/register/org', function(req, res){
  res.render('signup.jade', {group: 'organism'});
});

router.get('/register/platform', function(req, res){
  res.render('signup.jade', {group: 'user'});
});

/* Handle Registration POST */
router.post('/register', function(req, res){
  //Add user
  newUser = new User({
    username: req.body.username,
    password: req.body.password
  });
  newUser.save({});

  passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/register',
    failureFlash : true 
  });

  res.render('accueil.jade');
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
