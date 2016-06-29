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

router.get('/login', function(req, res, next){
  if(req.query.login_error){
    res.render('login.jade', {error: 1});
  }
  else{
    res.render('login.jade');
  }
});

router.post('/login', 
  passport.authenticate(['local-volunteer', 'local-organism'], 
  {
    failureRedirect: '/login?login_error=1',
    failureFlash: true
  }),
  function(req, res){
    console.log(JSON.stringify(req.user));
    if(req.user.group == "organism"){
      req.session.organism = req.user;
      req.session.group = "organism";
      res.redirect('/dashboard'); 
    }
    else if(req.user.group == "volunteer"){
      req.session.volunteer = req.user;
      req.session.group = "volunteer";
      res.redirect('/map');
    }
  });

router.post('/logout', function(req, res){
  req.session.destroy();
  res.redirect('/');
});

/* GET Registration Page */
router.get('/register_organism', function(req, res){
  res.render('register.jade', {group: 'organism'});
});

router.get('/register_volunteer', function(req, res){
  res.render('register.jade', {group: 'volunteer'});
});

/* Handle Registration POST */
router.post('/register_volunteer', function(req, res){
  //Add user
  newUser = new User({
    email: req.body.email,
    lastname: req.body.lastname,
    firstname: req.body.firstname,
    birthdate: req.body.birthdate
  });

  newUser.password = newUser.generateHash(req.body.password);

  newUser.save({});
  res.redirect('/');
});

/* Handle Registration POST */
router.post('/register_organism', function(req, res){
  newOrganism = new Organism({
    email: req.body.email,
    orgName: req.body.organism,
    name: req.body.name,
    lastname: req.body.lastname,
    firstname: req.body.firstname,
    password: req.body.password,
    phone: req.body.phone,
    website: req.body.website,
    neq: req.body.neq,
    cause: req.body.cause
  });

  newOrganism.password = newOrganism.generateHash(req.body.password);

  newOrganism.save({});
  res.redirect('/');
});

router.get('/dashboard', function(req, res){
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

/*GET map page*/
router.get('/map', function(req, res){
  Opp.find({}, function(err, opps){
    if(err){
      console.log(err);
      res.render('map.jade', {session: req.session, error: err});
    }
    //Create opps list
    else{           
      console.log(req.isAuthenticated());
      res.render('map.jade', {opps: opps, 
        user: req.isAuthenticated()});
    }
  });
});

module.exports = router;
