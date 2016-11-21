'use strict';
var express = require('express');
var router = express.Router();
var passport = require('passport');
var Intercom = require('intercom-client');
var school_list = require('../lib/ressources/school_list.js');
var client = new Intercom.Client({
  token: process.env.INTERCOM_TOKEN
});
var crypt = require('../auth/crypt');

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
  passport.authenticate(['local-admin', 'local-organism', 'local-volunteer'], function(err, user, info) {
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
    console.log(user.email + ' is connected !');
    if (user.group == "organism") {
      req.session.organism = user;
      req.session.group = "organism";
      console.log('IN LOGIN post and req.session.group = ' + req.session.group);
      //Intercom create connexion event
      client.events.create({
        event_name: 'org_connexion',
        created_at: Math.round(Date.now() / 1000),
        user_id: user._id
      });
      client.users.update({
        user_id: user._id,
        custom_attributes: {
          group: 'organism'
        },
        update_last_request_at: true,
        new_session: true
      });
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
      //Intercom create connexion event
      client.events.create({
        event_name: 'vol_connexion',
        created_at: Math.round(Date.now() / 1000),
        user_id: user._id
      });
      client.users.update({
        user_id: user._id,
        custom_attributes: {
          group: 'volunteer'
        },
        update_last_request_at: true,
        new_session: true
      });
      req.session.save(function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/volunteer/map');
      });
    } else if (user.group == "admin") {
      req.session.admin = user;
      req.session.group = "admin";
      Organism.findOne({
        admin_id: req.session.admin._id
      }, function(err, org) {
        if (err) {
          return next(err);
        }
        req.session.organism = org;
        console.log('IN LOGIN post and req.session.group = ' + req.session.group);
        //Intercom create connexion event
        client.events.create({
          event_name: 'admin_connexion',
          created_at: Math.round(Date.now() / 1000),
          user_id: user._id
        });
        client.users.update({
          user_id: user._id,
          custom_attributes: {
            group: 'admin'
          },
          update_last_request_at: true,
          new_session: true
        });
        req.session.save(function(err) {
          if (err) {
            return next(err);
          }
          res.redirect('/admin/classes');
        });
      });
    }
  })(req, res, next);
});

router.post('*/logout', function(req, res, next) {
  //Intercom create logout event
  client.events.create({
    event_name: 'logout',
    created_at: Math.round(Date.now() / 1000),
    user_id: req.session[req.session.group]._id
  });
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
    type: 'organism'
  });
});

router.get('/register_volunteer', function(req, res) {
  //Get schools_list
  school_list.getSchoolList('./res/schools_list.csv', function(err, schools_list) {
    if (err) {
      console.error('ERR : ' + err);
    };
    res.render('g_register.jade', {
      type: 'volunteer',
      error: err,
      schools_list
    });
  });
});

router.get('/register_admin', function(req, res) {
  res.render('g_register.jade', {
    type: 'admin'
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
      //Chack if an admin has been selected
      console.info('req.body : ' + String(req.body));
      let admin = {};
      let student = false;
      let school_name = null;
      let birthdate = new Date(req.body.birthdate).getTime();
      birthdate = birthdate / 1000;

      if (req.body.admin_checkbox && req.body.admin) {
        console.info('Belongs to Admin : ' + req.body.admin_checkbox);
        student = true;
        school_name = req.body.admin;
        admin = {
          school_name: req.body.admin
        }
      };

      let newVolunteer = new Volunteer({
        email: req.body.email,
        email_verified: false,
        email_verify_string: randomString,
        lastname: req.body.lastname,
        firstname: req.body.firstname,
        birthdate: req.body.birthdate,
        password: req.body.password,
        events: [],
        long_terms: [],
        manuals: [],
        extras: [],
        admin,
        student
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
              button: {
                link: verifyUrl
              },
              firstname: req.body.firstname
            });
          };
          if (admin) {
            Admin.update({
              'name': req.body.admin
            }, {
              '$push': {
                'students': {
                  '_id': vol._id,
                  'status': 'automatic_subscription'
                }
              }
            }, {
              new: true
            }, function(err, admins_updated) {
              if (err) {
                console.log(err);
              }
              console.log('The volunteer has a school : ' + req.body.admin + ', and the number of admins updated is : ' + JSON.stringify(admins_updated));
              //Add school_id to the student
              Admin.findOne({
                'name': req.body.admin,
                'type': 'school-coordinator'
              }, function(err, admin_coordinator) {
                if (err) {
                  console.error(err);
                };
                if (admin_coordinator != null) {
                  admin = {
                    school_name: admin_coordinator.name,
                    school_id: admin_coordinator._id
                  };
                  Volunteer.update({
                    '_id': vol._id
                  }, {
                    '$set': {
                      'admin': admin,
                      'student': true
                    }
                  }, function(err, vol_updated) {
                    if (err) {
                      console.error(err);
                    }
                  })
                };
              });
            });
          };
          // Intercom creates volunteers
          client.users.create({
            email: vol.email,
            name: vol.firstname + ' ' + vol.lastname,
            user_id: vol._id,
            signed_up_at: Math.round(Date.now() / 1000),
            last_request_at: Math.round(Date.now() / 1000),
            custom_attributes: {
              birthdate_at: birthdate,
              firstname: vol.firstname,
              group: 'volunteer',
              school_name: school_name,
              student: student
            }
          });
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

      let newOrganism = new Organism({
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
              button: {
                link: verifyUrl
              },
              firstname: req.body.firstname
                //customMessage: 'Congratulations, create an event to get volunteers!'
            });
            res.locals.recipient = email;
            res.locals.name = org_name;
            res.locals.verify_url = verifyUrl;
            res.locals.firstname = req.body.firstname;
          };
          client.users.create({
            email: org.email,
            name: org.org_name,
            user_id: org._id,
            signed_up_at: Math.round(Date.now() / 1000),
            custom_attributes: {
              firstname: org.firstname,
              group: 'organism'
            }
          });
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
  let newAdmin = new Admin({
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

router.post('*/register_check', function(req, res) {

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
    button: {
      link: req.body.verify_url
    },
    firstname: req.body.firstname
      //customMessage: 'Congratulations, create an event to get volunteers!'
  });
});


router.get('/waitforverifying', function(req, res) {
  res.render('g_message.jade', {
    page: 'waitforverifying',
    message: 'Vous allez recevoir un courriel de vérification. Dans ce courriel, cliquez sur le lien pour vérifier votre compte. Et l\'aventure pourra commencer !',
    header: 'Courriel de vérification',
    redirection: 'login',
    recipient: req.query.recipient,
    verify_url: req.query.verify_url,
    firstname: req.query.firstname
  });
});

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

router.post('/forgottenpassword', function(req, res) {
  console.log('forgottenpassword beginning' + req.body.email);
  const newPassword = randomstring.generate().substring(0, 11);
  const passHash = crypt.generateHash(newPassword);
  const content = {
    customMessage: 'Ton nouveau mot de passe est : ' + newPassword,
    recipient: req.body.email
  };
  //TO DELETE
  console.log('New password generated : ' + passHash);
  Volunteer.findOneAndUpdate({
    'email': req.body.email
  }, {
    '$set': {
      'password': passHash
    }
  }, function(err, doc) {
    if (err) {
      console.error(err);
      res.status(404).send({
        error: 'Problème de serveur : réessayer et sinon contactez nous à francois@simplyk.org'
      });
    } else if (doc) {
      console.info('Password forgotten : volunteer password changed');
      emailer.sendForgottenPasswordEmail(content);
      res.sendStatus(200);
    } else {
      console.info('Password forgotten : no volunteer account found with this email');
      Admin.findOneAndUpdate({
        'email': req.body.email
      }, {
        '$set': {
          'password': passHash
        }
      }, function(err, doc) {
        if (err) {
          console.error(err);
          res.status(404).send({
            error: 'Problème de serveur : réessayer et sinon contactez nous à francois@simplyk.org'
          });
        } else if (doc) {
          console.info('Password forgotten : admin password changed');
          emailer.sendForgottenPasswordEmail(content);
          res.sendStatus(200);
        } else {
          console.info('Password forgotten : no admin account found with this email');
          Organism.findOneAndUpdate({
            'email': req.body.email
          }, {
            '$set': {
              'password': passHash
            }
          }, function(err, doc) {
            if (err) {
              console.error(err);
              res.status(404).send({
                error: 'Problème de serveur : réessayer et sinon contactez nous à francois@simplyk.org'
              });
            } else if (doc) {
              console.info('Password forgotten : organism password changed');
              emailer.sendForgottenPasswordEmail(content);
              res.sendStatus(200);
            } else {
              console.info('Password forgotten : 0 account found with this email');
              res.status(404).send({
                error: 'Aucun compte n\'a été trouvé avec cette adresse mail'
              });
            }
          })
        }
      })
    }
  })
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
          Admin.findOne({
            email: email
          }, function(err, admin) {
            if (admin) {
              handler(true);
            } else {
              handler(false);
            }
          });
        }
      });
    }
  });
};


module.exports = router;