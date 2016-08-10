var express = require('express');
var router = express.Router();
var passport = require('passport')

var Volunteer = require('../models/volunteer_model.js');
var Organism = require('../models/organism_model.js');
var Admin = require('../models/admin_model.js');

var emailer = require('../email/emailer.js')

var emailCredentials = process.env.EMAIL_CREDENTIALS;

router.get('/login', function(req, res, next){
  if(req.query.login_error){
    res.render('g_login.jade', {error: 1});
  }
  else{
    res.render('g_login.jade');
  }
});

router.post('/login', 
  passport.authenticate(['local-volunteer', 'local-organism', 'local-admin'], 
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
    else if(req.user.group == "admin"){
      req.session.admin = req.user;
      req.session.group = "admin";
      res.redirect('/admin/dashboard');
    }
  });

router.post('/logout', function(req, res){
  req.session.destroy();
  res.redirect('/');
});

/* GET Registration Page */
router.get('/register_organism', function(req, res){
  res.render('g_register.jade', {group: 'organism'});
});

router.get('/register_volunteer', function(req, res){
  res.render('g_register.jade', {group: 'volunteer'});
});

router.get('/register_admin', function(req, res){
  res.render('g_register.jade', {group: 'admin'});
});

/* Handle Registration POST for volunteer*/
router.post('/register_volunteer', function(req, res){
  //Add volunteer
  newVolunteer = new Volunteer({
    email: req.body.email,
    lastname: req.body.lastname,
    firstname: req.body.firstname,
    birthdate: req.body.birthdate,
    password: req.body.password
  });

  newVolunteer.password = newVolunteer.generateHash(req.body.password);

  newVolunteer.save({});
  res.redirect('/');
});

/* Handle Registration POST for organism*/
router.post('/register_organism', function(req, res){
  var email = req.body.email;
  var org_name = req.body.name;

  newOrganism = new Organism({
    email: email,
    org_name: org_name,
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

  if(emailCredentials) {
    emailer.sendWelcomeEmail({
      recipient: email,
      name: org_name,
      customMessage: 'Congratulation, create an event to get volunteers!'
    });
  }

  res.redirect('/');
});

/* Handle Registration POST for admin*/
router.post('/register_admin', function(req, res){
  //Add Volunteer
  newAdmin = new Admin({
    email: req.body.email,
    name: req.body.name,
    type: req.body.type,
    lastname: req.body.lastname,
    firstname: req.body.firstname,
    password: req.body.password,
    birthdate: req.body.birthdate
  });

  newAdmin.password = newAdmin.generateHash(req.body.password);

  newAdmin.save({});
  res.redirect('/');
});

module.exports = router;
