'use strict';
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var emailer = require('../email/emailer.js');
var date = require('../lib/dates/date_browser.js');

var permissions = require('../middlewares/permissions.js');
var Organism = require('../models/organism_model.js');
var Volunteer = require('../models/volunteer_model.js');
var Admin = require('../models/admin_model.js');
var Activity = require('../models/activity_model.js');
var OrgTodo = require('../models/o_todo_model.js');


router.get('/admin/classes', permissions.requireGroup('admin'), function(req, res, next) {
  const student_ids = req.session.admin.students.map(function(el) {
    return el._id;
  });
  console.info('Import students to classes page ! ');
  let find_query = {};
  find_query['admin.school_name'] = req.session.admin.name;
  if (req.session.admin.type != 'school-coordinator') {
    let in_query = {};
    in_query['$in'] = req.session.admin.classes;
    find_query['admin.class'] = in_query;
  }
  console.info(JSON.stringify(find_query));
  Volunteer.find(find_query, function(err, volunteers) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème avec la recherche des élèves';
      next(err);
    } else {
      let classes_array = [];
      classes_array = JSON.parse(JSON.stringify(req.session.admin.classes));
      console.log('Classes array : ' + JSON.stringify(classes_array));

      //Determine student status
      volunteers.map(vol => {
        const extra_status_array = vol.extras.map(ext => {
          return ext.status;
        });

        if (extra_status_array.indexOf('denied') == -1) {
          const event_status_array = vol.events.map(ev => {
            return ev.status;
          });

          if (event_status_array.indexOf('denied') == -1) {
            const lt_status_array = vol.long_terms.map(lt => {
              return lt.status;
            });

            if (lt_status_array.indexOf('denied') == -1) {
              if ((extra_status_array.indexOf('confirmed') == -1) && (extra_status_array.indexOf('corrected') == -1)) {
                if ((event_status_array.indexOf('confirmed') == -1) && (event_status_array.indexOf('corrected') == -1)) {
                  if ((lt_status_array.indexOf('confirmed') == -1) && (lt_status_array.indexOf('corrected') == -1)) {
                    if ((lt_status_array.indexOf('validated') == -1) && (event_status_array.indexOf('validated') == -1) && (extra_status_array.indexOf('validated') == -1)) {
                      vol.status = ''
                      return vol;
                    } else {
                      vol.status = 'success';
                      return vol;
                    };
                    vol.status = ''
                    return vol;
                  } else {
                    vol.status = 'warning';
                    return vol;
                  };
                } else {
                  vol.status = 'warning';
                  return vol;
                };
              } else {
                vol.status = 'warning';
                return vol;
              };
            } else {
              vol.status = 'danger';
              return vol;
            };
          } else {
            vol.status = 'danger';
            return vol;
          };
        } else {
          vol.status = 'danger';
          return vol;
        };
      });

      volunteers.sort(function(a, b) {
        var lastnameA = a.lastname.toUpperCase(); // ignore upper and lowercase
        var lastnameB = b.lastname.toUpperCase(); // ignore upper and lowercase
        if (lastnameA < lastnameB) {
          return -1;
        }
        if (lastnameA > lastnameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });

      const hash = require('intercom-client').SecureMode.userHash({
        secretKey: process.env.INTERCOM_SECRET_KEY,
        identifier: req.session.admin._id
      });

      OrgTodo.find({
        'org_id': req.session.organism._id
      }, function(err, todos) {
        if (err) {
          err.type = 'MINOR';
          next(err);
        }
        res.status(200).render('a_classes.jade', {
          session: req.session,
          admin: req.session.admin,
          group: req.session.group,
          volunteers,
          classes_array,
          todos,
          hash
        });
      });
    }
  });
});



router.get('/admin/report:vol_id', permissions.requireGroup('admin'), function(req, res, next) {
  Volunteer.findById(req.params.vol_id, function(err, volunteer) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème avec la recherche de l\'élève dans la base de données';
      next(err);
    } else {
      //Remove opps with status refused
      function removeRefused(opp) {
        return opp.status != 'refused';
      }

      volunteer.events = volunteer.events.filter(removeRefused);
      volunteer.long_terms = volunteer.long_terms.filter(removeRefused);
      volunteer.extras = volunteer.extras.filter(removeRefused);

      //Add infos to each event from activity_id

      function getEventWithActivityInfos(event) {
        return new Promise((resolve, reject) => {
          Activity.findOne({
            '_id': event.activity_id
          }, 'intitule description', function(err, matching_activity) {
            if (err) {
              reject(err);
            } else {
              Organism.findOne({
                '_id': event.org_id
              }, 'events phone firstname lastname', function(err, matching_organism) {
                if (err) {
                  reject(err);
                } else {
                  let new_event = JSON.parse(JSON.stringify(event));
                  const new_event_description = (matching_organism.events.find(event => {
                    return (event.activities.indexOf(matching_activity._id) != -1)
                  })).description;
                  new_event['description'] = new_event_description;
                  new_event['activity_intitule'] = matching_activity.intitule;
                  new_event['org_phone'] = matching_organism.phone;
                  new_event['contact'] = matching_organism.firstname + ' ' + matching_organism.lastname;
                  if ((new_event.status == 'subscribed') && (new Date(new_event.day) < new Date())) {
                    new_event['status'] = 'past';
                  }
                  console.log('new_event in resolve : ' + JSON.stringify(new_event));
                  resolve(new_event);
                }
              })
            }
          })
        });
      };
      //Add infos to each event from activity_id

      function getLongtermWithOrgInfos(lt) {
        return new Promise((resolve, reject) => {
          Organism.findOne({
            '_id': lt.org_id
          }, 'email phone firstname lastname', function(err, matching_organism) {
            if (err) {
              reject(err);
            } else {
              let new_lt = JSON.parse(JSON.stringify(lt));
              new_lt['org_email'] = matching_organism.email;
              new_lt['org_phone'] = matching_organism.phone;
              new_lt['contact'] = matching_organism.firstname + ' ' + matching_organism.lastname;
              resolve(new_lt);
            }
          })
        });
      };

      Promise.all(volunteer.events.map(event => {
        return getEventWithActivityInfos(event);
      })).then(events => {
        console.log('Final events : ' + events);
        const hash = require('intercom-client').SecureMode.userHash({
          secretKey: process.env.INTERCOM_SECRET_KEY,
          identifier: req.session.admin._id
        });
        OrgTodo.find({
          'org_id': req.session.organism._id
        }, function(err, todos) {
          if (err) {
            err.type = 'MINOR';
            err.print = 'Problème avec la recherche de l\'élève dans la base de données';
            next(err);
          }
          Promise.all(volunteer.long_terms.map(lt => {
            return getLongtermWithOrgInfos(lt);
          })).then(complete_long_terms => {
            res.render('a_report.jade', {
              volunteer: volunteer,
              session: req.session,
              admin: req.session.admin,
              group: req.session.group,
              long_terms: complete_long_terms,
              events,
              todos,
              date,
              hash
            });
          }).catch(err => {
            err.type = 'CRASH';
            err.print = 'Problème avec la recherche de l\'élève dans la base de données';
            next(err);
          });
        });
      }).catch(err => {
        err.type = 'CRASH';
        err.print = 'Problème avec la recherche de l\'élève dans la base de données';
        next(err);
      });

    }
  });
});

router.post('/addmanualhours', permissions.requireGroup('admin'), function(req, res, next) {
  const vol_id = req.body.volunteer_id;
  const description = req.body.description;
  const hours_done = req.body.hours_done;
  const added = new Date();
  const manual_to_add = {
    admin_name: req.session.admin.firstname + ' ' + req.session.admin.lastname,
    admin_id: req.session.admin._id,
    hours_done,
    description,
    added
  };
  Volunteer.findOneAndUpdate({
      _id: vol_id
    }, {
      '$push': {
        'manuals': manual_to_add
      }
    }, {
      new: true
    },
    function(err, new_vol) {
      if (err) {
        err.type = 'MINOR';
        next(err);
        res.status(404).send({
          error: err
        });
      } else {
        const email_content = {
          admin_name: req.session.admin.firstname + ' ' + req.session.admin.lastname,
          recipient: new_vol.email,
          customMessage: [req.session.admin.firstname + ' ' + req.session.admin.lastname + ' vient d\'ajouter des heures à ton profil Simplyk !', 'Va les voir tout de suite en cliquant sur le bouton en-dessous !', 'Et n\'oublie pas de t\'inscrire à de nouvelles opportunités pour faire évoluer ton niveau d\'engagement !']
        };

        emailer.sendManualHoursEmail(email_content);
        res.status(200).send({
          newManual: manual_to_add
        });
      };
    });

});

router.post('/changeclass', permissions.requireGroup('admin'), function(req, res, next) {
  Volunteer.update({
    '_id': req.body.volunteer
  }, {
    $set: {
      'admin.class': req.body.new_class
    }
  }, function(err) {
    if (err) {
      err.type = 'MINOR';
      next(err);
      console.error(err);
      res.status(404).send(err);
    } else {
      console.info('SUCCESS : Change class to ' + req.body.new_class + ' for the volunteer ' + req.body.volunteer);
      res.status(200).end();
    }
  });
});

router.get('/admin/internopps', permissions.requireGroup('admin'), function(req, res, next) {
  res.render('o_dashboard.jade', {
    session: req.session,
    admin: req.session.admin,
    group: req.session.group
  });
});

router.post('/admin/validate', permissions.requireGroup('admin'), function(req, res, next) {
  console.info('In validate with req.body ! : ' + JSON.stringify(req.body));
  let find_query = {
    '_id': req.body.vol
  };
  find_query[req.body.type + '._id'] = req.body.id;
  let update_query = {};
  update_query[req.body.type + '.$.status'] = 'validated';
  console.info('C\'est dans validate update_query! : ' + JSON.stringify(update_query));
  console.info('C\'est dans validate find_query! : ' + JSON.stringify(find_query));
  Volunteer.findOneAndUpdate(find_query, update_query, {
    new: true
  }, function(err, new_vol) {
    if (err) {
      console.error('ERROR : ' + err);
      res.status(404).send({
        message: 'Erreur lors de l\'opération'
      });
    } else {
      console.info('MESSAGE : ' + err);
      res.status(200).send({
        message: 'VALIDÉ'
      });

      const email_content = {
        admin_name: req.session.admin.firstname + ' ' + req.session.admin.lastname,
        recipient: new_vol.email,
        customMessage: [req.session.admin.firstname + ' ' + req.session.admin.lastname + ' vient de valider ta participation à un bénévolat !', 'Va les voir tout de suite en cliquant sur le bouton en-dessous !', 'Et n\'oublie pas de t\'inscrire à de nouvelles opportunités pour faire évoluer ton niveau d\'engagement !']
      };

      emailer.sendAdminValidateEmail(email_content);
    }
  })
});

router.post('/admin/deny', permissions.requireGroup('admin'), function(req, res, next) {
  console.info('In deny with req.body ! : ' + JSON.stringify(req.body));
  let find_query = {
    '_id': req.body.vol
  };
  find_query[req.body.type + '._id'] = req.body.id;
  let update_query = {};
  update_query[req.body.type + '.$.status'] = 'denied';
  console.info('C\'est dans deny update_query! : ' + JSON.stringify(update_query));
  console.info('C\'est dans deny find_query! : ' + JSON.stringify(find_query));
  Volunteer.findOneAndUpdate(find_query, update_query, {
    new: true
  }, function(err, new_vol) {
    if (err) {
      console.error('ERROR : ' + err);
      res.status(404).send({
        message: 'Erreur lors de l\'opération'
      });
    } else {
      console.info('MESSAGE : ' + err);
      res.status(200).send({
        message: 'À REVOIR'
      });

      const email_content = {
        admin_name: req.session.admin.firstname + ' ' + req.session.admin.lastname,
        recipient: new_vol.email,
        customMessage: [req.session.admin.firstname + ' ' + req.session.admin.lastname + ' attends que tu corriges ta participation à un bénévolat !', 'Va le corriger en cliquant sur le bouton en-dessous !', 'Et n\'oublie pas de t\'inscrire à de nouvelles opportunités pour faire évoluer ton niveau d\'engagement !']
      };

      emailer.sendAdminCorrectEmail(email_content);
    }
  })
});

router.post('/admin/refuse', permissions.requireGroup('admin'), function(req, res, next) {
  console.info('In refuse with req.body ! : ' + JSON.stringify(req.body));
  let find_query = {
    '_id': req.body.vol
  };
  find_query[req.body.type + '._id'] = req.body.id;
  let update_query = {};
  update_query[req.body.type + '.$.status'] = 'refused';
  console.info('C\'est dans refuse update_query! : ' + JSON.stringify(update_query));
  console.info('C\'est dans refuse find_query! : ' + JSON.stringify(find_query));
  Volunteer.findOneAndUpdate(find_query, update_query, {
    new: true
  }, function(err, new_vol) {
    if (err) {
      console.error('ERROR : ' + err);
      res.status(404).send({
        message: 'Erreur lors de l\'opération'
      });
    } else {
      console.info('MESSAGE : ' + err);
      res.status(200).send({
        message: 'À REVOIR'
      });

      const email_content = {
        admin_name: req.session.admin.firstname + ' ' + req.session.admin.lastname,
        recipient: new_vol.email,
        customMessage: [req.session.admin.firstname + ' ' + req.session.admin.lastname + ' vient de refuser ta participation à un bénévolat !', 'Va voir tout de suite sur la plateforme en cliquant sur le bouton en-dessous !', 'Et n\'oublie pas de t\'inscrire à de nouvelles opportunités pour faire évoluer ton niveau d\'engagement !']
      };

      emailer.sendAdminRefuseEmail(email_content);
    }
  })
});

router.get('/admin/profile', permissions.requireGroup('admin'), function(req, res) {
  console.info('Begin get /profile')
  res.render('a_profile.jade', {
    admin: req.session.admin,
    session: req.session,
    group: req.session.group
  });
});

module.exports = router;