var express = require('express');
var router = express.Router();
var passport = require('passport')

var Volunteer = require('../models/volunteer_model.js');
var Organism = require('../models/organism_model.js');
var Admin = require('../models/admin_model.js');

var emailer = require('../email/emailer.js')
var randomstring = require('randomstring');

var emailCredentials = process.env.EMAIL_CREDENTIALS;

router.get('/login', function(req, res, next) {
  if (req.query.login_error) {
    res.render('g_login.jade', {
      error: req.query.login_error
    });
  } else {
    res.render('g_login.jade');
  }
});

router.get('/legal', function(req, res) {
  res.render('g_legal.jade');
});

router.post('/login', function(req, res, next) {
  passport.authenticate(['local-volunteer', 'local-admin', 'local-organism'], function(err, user, info) {
    console.log(info);
    if (err) {
      return next(err);
    };

    if (!user) {
      //If the user exists in the database but an other error happened
      var loginError = info.filter(function(item) {
        if (item.exists) {
          return true;
        }
      });

      console.log(loginError);

      //If the login Error is present we use the error code
      if (loginError.length === 1) {
        return res.redirect('login?login_error=' + loginError[0].code);
      } else {
        return res.redirect('login?login_error=1')
      }
    };

    console.log(JSON.stringify(user));
    if (user.group == "organism") {
      req.session.organism = user;
      req.session.group = "organism";
      console.log('IN LOGIN post and req.session.group = ' + req.session.group);
      req.session.save(function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/organism/dashboard');
      });
    } else if (user.group == "volunteer") {
      req.session.volunteer = user;
      req.session.group = "volunteer";
      console.log('IN LOGIN post and req.session.group = ' + req.session.group);
      req.session.save(function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/volunteer/map');
      });
    } else if (user.group == "admin") {
      req.session.admin = user;
      req.session.group = "admin";
      console.log('IN LOGIN post and req.session.group = ' + req.session.group);
      req.session.save(function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/admin/classes');
      });
    }
  })(req, res, next);
});

router.post('*/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) {
      return next(err);
    };
    res.redirect('/');
  });
});

/* GET Registration Page */
router.get('/register_organism', function(req, res) {
  res.render('g_register.jade', {
    group: 'organism'
  });
});

router.get('/register_volunteer', function(req, res) {
  res.render('g_register.jade', {
    group: 'volunteer'
  });
});

router.get('/register_admin', function(req, res) {
  res.render('g_register.jade', {
    group: 'admin'
  });
});

/* Handle Registration POST for volunteer*/
router.post('/register_volunteer', function(req, res) {
  const randomString = randomstring.generate();
  var email = req.body.email;

  function handleVolunteerCreation(exists) {
    if (exists) {
      res.redirect('register_volunteer');
    } else {
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

      newVolunteer.save(function(err, vol) {
        if (err) {
          res.redirect('/?error=' + err);
        } else {
          if (emailCredentials) {
            var hostname = req.headers.host;
            var verifyUrl = 'http://' + hostname + '/verifyV/' + randomString;

            console.log('Verify url sent: ' + verifyUrl);

            emailer.sendVerifyEmail({
              recipient: req.body.email,
              verify_url: verifyUrl,
              firstname: req.body.firstname
            });
          }
          res.redirect('/waitforverifying?recipient=' + req.body.email + '&verify_url=' + verifyUrl + '&firstname=' + req.body.firstname);
        }
      });
    }
  }
  userExists(email, handleVolunteerCreation);
});

/* Handle Registration POST for organism*/
router.post('/register_organism', function(req, res) {
  const randomString = randomstring.generate();
  const email = req.body.email;
  var org_name = req.body.name;

  function handleVolunteerCreation(exists) {
    if (exists) {
      res.redirect('register_organism');
    } else {

      newOrganism = new Organism({
        email: email,
        org_name: org_name,
        lastname: req.body.lastname,
        firstname: req.body.firstname,
        email_verified: false,
        email_verify_string: randomString,
        password: req.body.password,
        phone: req.body.phone,
        website: req.body.website,
        neq: req.body.neq,
        cause: req.body.cause,
        description: req.body.description,
        validation: false
      });

      newOrganism.password = newOrganism.generateHash(req.body.password);

      newOrganism.save(function(err, org) {
        if (err) {
          res.redirect('/?error=' + err);
        } else {
          if (emailCredentials) {
            var hostname = req.headers.host;
            var verifyUrl = 'http://' + hostname + '/verifyO/' + randomString;

            console.log('Verify url sent: ' + verifyUrl);
            emailer.sendVerifyEmail({
              recipient: email,
              name: org_name,
              verify_url: verifyUrl,
              firstname: req.body.firstname
                //customMessage: 'Congratulations, create an event to get volunteers!'
            });
            res.locals.recipient = email;
            res.locals.name = org_name;
            res.locals.verify_url = verifyUrl;
            res.locals.firstname = req.body.firstname;
          }
          res.redirect('/waitforverifying?recipient=' + email + '&verify_url=' + verifyUrl + '&firstname=' + req.body.firstname);
        }
      });
    }
  }
  userExists(email, handleVolunteerCreation);
});

/* Handle Registration POST for admin*/
router.post('/register_admin', function(req, res) {
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

router.post('/register_check', function(req, res) {

  function handleCheck(exists) {
    res.json({
      success: true,
      exists: exists
    });
  }

  userExists(req.body.email, handleCheck);
});

router.post('/sendVerificationEmail', function(req, res) {
  emailer.sendVerifyEmail({
    recipient: req.body.recipient,
    verify_url: req.body.verify_url,
    firstname: req.body.firstname
  });
})


router.get('/waitforverifying', function(req, res) {
  res.render('g_message.jade', {
    page: 'waitforverifying',
    message: 'Vous allez recevoir un courriel de vérification. Dans ce courriel, cliquez sur le lien pour vérifier votre compte. Et l\'aventure pourra commencer !',
    header: 'Courriel de vérification',
    redirection: 'login',
    recipient: req.query.recipient,
    verify_url: req.query.verify_url,
    firstname: req.query.firstname
  })
})

//Verify volunteer email address by random generated string
router.get('/verifyV/:verifyString', function(req, res) {
  console.log('String entered: ' + req.params.verifyString);

  //Look for the string entered in the database
  //Can do a string length check too
  Volunteer.findOne({
    email_verify_string: req.params.verifyString
  }, function(err, volunteer) {
    console.log(err);
    if (err) {
      res.send(err);
    }

    if (volunteer) {
      //If we found a volunteer with the corresponding verify string we verify the volunteer email
      if (volunteer.email_verified != true) {
        volunteer.email_verified = true;
        volunteer.save({});

        res.render('g_verify.jade', {
          email: volunteer.email
        });
      } else {
        res.render('g_message.jade', {
          message: 'This account email address has already been verified',
          redirection: 'login'
        });
      }
    } else {
      res.render('404.jade');
    }
  });
  //return res.status(404).send('This page is not valid');
});

//Verify organism email address by random generated string
router.get('/verifyO/:verifyString', function(req, res) {
  console.log('String entered: ' + req.params.verifyString);

  //Look for the string entered in the database
  //Can do a string length check too
  Organism.findOne({
    email_verify_string: req.params.verifyString
  }, function(err, organism) {
    console.log(err);
    if (err) {
      res.send(err);
    }

    if (organism) {
      //If we found a organism with the corresponding verify string we verify the organism email
      if (organism.email_verified != true) {
        organism.email_verified = true;
        organism.save({});

        res.render('g_verify.jade', {
          email: organism.email
        });
      } else {
        res.render('g_message.jade', {
          message: 'This account email address has already been verified',
          redirection: 'login'
        });
      }
    } else {
      res.render('404.jade');
    }
  });
  //return res.status(404).send('This page is not valid');
});


function userExists(email, handler) {
  //Look for email in volunteer, organism and admin
  Volunteer.findOne({
    email: email
  }, function(err, volunteer) {
    console.log(JSON.stringify(volunteer));
    if (volunteer) {
      handler(true);
    } else {
      Organism.findOne({
        email: email
      }, function(err, organism) {
        if (organism) {
          handler(true);
        } else {
          handler(false);
        }
      });
    }
  });
};


module.exports = router;