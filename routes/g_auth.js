var express = require('express');
var router = express.Router();
var passport = require('passport')

var Volunteer = require('../models/volunteer_model.js');
var Organism = require('../models/organism_model.js');
var Admin = require('../models/admin_model.js');

var emailer = require('../email/emailer.js')
var randomstring = require('randomstring');

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
  var randomString = randomstring.generate();

  //Add volunteer
  newVolunteer = new Volunteer({
    email: req.body.email,
    email_verified: false,
    email_verify_string: randomString,
    lastname: req.body.lastname,
    firstname: req.body.firstname,
    birthdate: req.body.birthdate,
    password: req.body.password
  });

  newVolunteer.password = newVolunteer.generateHash(req.body.password);

  newVolunteer.save({});

  if(emailCredentials) {
    var hostname = req.headers.host; 
    var verifyUrl = hostname + '/verify/' + randomString;

    console.log('Verify url sent: ' + verifyUrl);

    emailer.sendVerifyEmail({
      recipient: req.body.email,
      verify_url: verifyUrl
    });
  }

  res.redirect('/login');
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
    cause: req.body.cause,
    description: req.body.description
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
  
  res.redirect('/login');
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

//Verify email address by random generated string
router.get('/verify/:verifyString', function(req, res) {
  console.log('String entered: ' + req.params.verifyString); 

  //Look for the string entered in the database
  //Can do a string length check too
  Volunteer.findOne({email_verify_string: req.params.verifyString}, function (err, volunteer) {
    console.log(err);
    if (err) { return; }

    if(volunteer) {
      //If we found a volunteer with the corresponding verify string we verify the volunteer email
      volunteer.email_verified = true;
      volunteer.save({});

      return res.status(200).send('Your account ' + volunteer.email + ' is now verified');
    } else {
      res.status(404).send('This page is not valid');
    }
  });

  return res.status(404).send('This page is not valid');
});

module.exports = router;
