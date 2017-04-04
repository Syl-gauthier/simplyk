'use strict';
var express = require('express');
var router = express.Router();
var passport = require('passport');
var Intercom = require('intercom-client');
var school_list = require('../lib/ressources/school_list.js');
var client_school_list = require('../lib/ressources/client_school_list.js');
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
    res.render('g_login.jade', {
    });
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
        if ((req.session.volunteer.events.find(function(ev) {
            return (Date.parse(ev.day) < Date.now() && ev.status === 'subscribed')
          }) != undefined) || (req.session.volunteer.extras.find(function(ext) {
            return (ext.status == 'denied')
          }) != undefined) || (req.session.volunteer.events.find(function(ev) {
            return (ev.status == 'denied')
          }) != undefined) || (req.session.volunteer.long_terms.find(function(lt) {
            return (lt.status == 'denied')
          }) != undefined)) {
          res.redirect('/volunteer/profile');
        } else {
          res.redirect('/volunteer/map');
        }
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
  if (req.session[req.session.group]) {
    client.events.create({
      event_name: 'logout',
      created_at: Math.round(Date.now() / 1000),
      user_id: req.session[req.session.group]._id
    });
  }
  req.session.destroy(function(err) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème lors de la déconnexion';
      next(err);
    } else {
      res.redirect('/');
    };
  });
});

/* GET Registration Page */
router.get('/register_organism', function(req, res) {
  res.render('g_register.jade', {
    type: 'organism'
  });
});

router.get('/register_volunteer', function(req, res, next) {
  //Get schools_list
  school_list.getSchoolList('./res/schools_list.csv', function(err, schools_list) {
    if (err) {
      err.type = 'MINOR';
      next(err);
    };
    client_school_list.getClientSchools(function(err, clients) {
      if (err) {
        err.type = 'MINOR';
        next(err);
      };
      res.render('g_register.jade', {
        type: 'volunteer',
        error: err + req.query.error,
        schools_list,
        clients
      });
    });
  });
});

router.get('/register_admin', function(req, res) {
  res.render('g_register.jade', {
    type: 'admin'
  });
});

/* Handle Registration POST for volunteer*/
router.post('/register_volunteer', function(req, res, next) {
  const randomString = randomstring.generate();
  var email = req.body.email;

  function handleVolunteerCreation(exists) {
    if (exists) {
      res.redirect('register_volunteer');
    } else {
      //Add volunteer
      let admin = {};
      let student = false;
      let school_name = null;
      let phone = req.body.phone;
      let birthdate = new Date(req.body.birthdate).getTime();
      birthdate = birthdate / 1000;

      function createVolunteer(student, admin) {
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
          phone,
          admin,
          student
        });

        newVolunteer.password = newVolunteer.generateHash(req.body.password);

        newVolunteer.save(function(err, vol) {
          if (err) {
            err.type = 'CRASH';
            err.print = 'Problème lors de l\'inscription';
            next(err);
          } else {
            if (emailCredentials) {
              var hostname = req.headers.host;
              var verifyUrl = 'http://' + hostname + '/verifyV/' + randomString;

              console.log('Verify url sent: ' + verifyUrl);

              emailer.sendVerifyEmail({
                group: 'vol',
                recipient: req.body.email,
                button: {
                  link: verifyUrl
                },
                firstname: req.body.firstname
              });
            };
            res.redirect('/waitforverifying?recipient=' + req.body.email + '&verify_url=' + verifyUrl + '&firstname=' + req.body.firstname);
            // Intercom creates volunteers
            client.users.create({
              email: vol.email,
              name: vol.firstname + ' ' + vol.lastname,
              user_id: vol._id,
              signed_up_at: Math.round(Date.now() / 1000),
              phone: req.body.phone,
              last_request_at: Math.round(Date.now() / 1000),
              custom_attributes: {
                birthdate_at: birthdate,
                firstname: vol.firstname,
                group: 'volunteer',
                school_name,
                student
              }
            });
          }
        });
      };

      if (req.body.admin_checkbox && req.body.admin) {
        console.info('Belongs to Admin : ' + req.body.admin_checkbox);
        student = true;
        school_name = req.body.admin;
        if (req.body.classe) {
          admin = {
            class: req.body.classe,
            school_name
          }
        } else {
          admin = {
            school_name
          }
        };

        Admin.findOne({
          'type': 'school-coordinator',
          'name': school_name
        }, function(err, coordinator) {
          if (err) {
            err.type = 'MINOR';
            next(err);
          }

          if (coordinator) {
            admin['school_id'] = coordinator._id;
          }

          createVolunteer(student, admin);
        });
      } else {
        createVolunteer(student, admin);
      };

    }
  }
  userExists(email, handleVolunteerCreation);
});

/* Handle Registration POST for organism*/
router.post('/register_organism', function(req, res, next) {
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
          err.type = 'CRASH';
          err.print = 'Problème lors de la création de compte';
          next(err);
        } else {
          if (emailCredentials) {
            var hostname = req.headers.host;
            var verifyUrl = 'http://' + hostname + '/verifyO/' + randomString;

            console.log('Verify url sent: ' + verifyUrl);
            emailer.sendVerifyEmail({
              group: 'org',
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
  res.end();
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
router.get('/verifyV/:verifyString', function(req, res, next) {
  console.log('String entered: ' + req.params.verifyString);

  //Look for the string entered in the database
  //Can do a string length check too
  Volunteer.findOne({
    email_verify_string: req.params.verifyString
  }, function(err, volunteer) {
    console.log(err);
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème lors de la validation du compte';
      next(err);
    } else {
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
    }
  });
  //return res.status(404).send('This page is not valid');
});

//Verify organism email address by random generated string
router.get('/verifyO/:verifyString', function(req, res, next) {
  console.log('String entered: ' + req.params.verifyString);

  //Look for the string entered in the database
  //Can do a string length check too
  Organism.findOne({
    email_verify_string: req.params.verifyString
  }, function(err, organism) {
    console.log(err);
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème lors de la validation du compte';
      next(err);
    } else {
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
    }
  });
  //return res.status(404).send('This page is not valid');
});

router.post('/forgottenpassword', function(req, res, next) {
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

      err.type = 'MINOR';
      next(err);
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

          err.type = 'MINOR';
          next(err);
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

              err.type = 'MINOR';
              next(err);
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