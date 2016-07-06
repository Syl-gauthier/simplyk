var express = require('express');
var router = express.Router();
var passport = require('passport')

var User = require('../models/user_model.js');
var Organism = require('../models/organism_model.js');

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
      res.redirect('/organism/dashboard'); 
    }
    else if(req.user.group == "volunteer"){
      req.session.volunteer = req.user;
      req.session.group = "volunteer";
      res.redirect('/volunteer/map');
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

module.exports = router;
