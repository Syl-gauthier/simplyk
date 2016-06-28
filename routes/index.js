var express = require('express');
var router = express.Router();
var passport = require('passport')
var jade = require('jade');

var GoogleMapsAPI = require('googlemaps');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Opp = require('../models/opp_model.js');
var User = require('../models/user_model.js');
var Organism = require('../models/organism_model.js');

var app = express();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('accueil.jade');
});

router.get('/login', function(req, res, next){
  if(req.query.login_error){
    res.render('login.jade', {error: 1});
  }
  else{
    res.render('login.jade');
  }
});

router.post('/login', 
  passport.authenticate(['local-user', 'local-org'], 
  {failureRedirect: '/login?login_error=1'}),
  function(req, res){
    console.log(JSON.stringify(req.user));
    if(req.user.group == "org"){
      res.redirect('/dashboard'); 
    }
    else if(req.user.group == "platform"){
      res.redirect('/map');
    }
});


/* GET Registration Page */
router.get('/register_org', function(req, res){
  res.render('signup.jade', {group: 'organism'});
});

router.get('/register_platform', function(req, res){
  res.render('signup.jade', {group: 'platform'});
});

/* Handle Registration POST */
router.post('/register_platform', function(req, res){
  //Add user
  newUser = new User({
    username: req.body.username,
    password: req.body.password
  });
  newUser.save({});

  res.render('accueil.jade');
});

/* Handle Registration POST */
router.post('/register_organism', function(req, res){
  //Add user
  newOrganism = new Organism({
    username: req.body.username,
    orgName: req.body.organism,
    password: req.body.password
  });
  newOrganism.save({});

  res.render('accueil.jade');
});

router.get('/dashboard', function(req, res){
  console.log(req.session);
  console.log(req.user);
  
  Opp.find({oName: req.user.customData.name}, function(err, opps){
    if(err){
      console.log(err);
      res.render('dashboard.jade', {session: req.session, error: err});
    }
    //Create opps list
    else{
      console.log(opps.toString());
      res.render('dashboard.jade', {opps: opps, session: req.session, error: err});
    }
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

/*GET map page*/
router.get('/map', function(req, res){
  Opp.find({}, function(err, opps){
    if(err){
      console.log(err);
      res.render('map.jade', {session: req.session, 
        error: err});
    }
    //Create opps list
    else{			
      res.render('map.jade', {opps: opps, 
        session: req.session, 
        user: req.user});
    }
  });
});

module.exports = router;
