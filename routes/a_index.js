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
      console.error('There is an error to access /listorganisms and get all the volunteers, the error is : ' + err);
      res.render('a_classes.jade', {
        error: err,
        session: req.session,
        admin: req.session.admin,
        group: req.session.group
      });
    } else {
      let classes_array = [];
      classes_array = JSON.parse(JSON.stringify(req.session.admin.classes));
      if (req.session.admin.type == 'school-coordinator') {
        classes_array.push('Sans classe');
      }
      console.log('Classes array : ' + JSON.stringify(classes_array));

      res.status(200).render('a_classes.jade', {
        session: req.session,
        admin: req.session.admin,
        group: req.session.group,
        volunteers,
        classes_array
      });
    }
  });
});



router.get('/admin/report:vol_id', permissions.requireGroup('admin'), function(req, res, next) {
  Volunteer.findById(req.params.vol_id, function(err, volunteer) {
    if (err) {
      console.error('There is an error to access report, the error is : ' + err);
      res.render('a_classes.jade', {
        error: err,
        session: req.session,
        admin: req.session.admin,
        group: req.session.group
      });
    } else {
      /*var formatted_events = volunteer.events;
      for (var i = 0; i < formatted_events.length; i++) {
        for (var k = 0; k < formatted_events.length; k++) {
          if (formatted_events[i].activity_id.toString() == formatted_events[k].activity_id.toString()) {
            if ((formatted_events[i].status != 'gathered') && (formatted_events[i] != formatted_events[k])) {
              formatted_events[i].hours_done += formatted_events[k].hours_done;
              formatted_events[i].hours_pending += formatted_events[k].hours_pending;
              if (formatted_events[i].student_answers.length > formatted_events[k].student_answers.length) {} else if (formatted_events[i].student_answers.length < formatted_events[k].student_answers.length) {
                formatted_events[i].student_answers = formatted_events[k].student_answers;
              } else {};
              formatted_events[k].status = 'gathered';
            }
          }
        }
      };*/
      res.render('a_report.jade', {
        volunteer: volunteer,
        events: volunteer.events,
        session: req.session,
        group: req.session.group,
        date
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
        console.error(err);
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
      console.error(err);
      res.status(404).send(err);
    } else {
      console.info('SUCCESS : Change class to ' + req.body.new_class + ' for the volunteer ' + req.body.volunteer);
      Admin.update({
        'name': req.session.admin,
        'type': 'school-teacher',
        'classes': {
          $ne: req.body.new_class
        }
      }, {
        $pull: {
          'students': {
            '_id': req.body.volunteer
          }
        }
      }, {
        multi: true
      }, function(err, report0) {
        if (err) {
          console.error(err);
          res.status(404).send(err);
        } else {
          console.info('SUCCESS : Remove the student volunteer to ancient admins. Report :' + report0);
          const student_to_add = {
            '_id': req.body.volunteer,
            'status': 'automatic_subscription'
          };
          Admin.update({
            'name': req.session.admin,
            'type': 'school-teacher',
            'classes': req.body.new_class
          }, {
            $push: {
              'students': student_to_add
            }
          }, {
            multi: true
          }, function(err, report1) {
            if (err) {
              console.error(err);
              res.status(404).send(err);
            } else {
              console.info('SUCCESS : Add the student volunteer to new admins. Report :' + report1);
              res.status(200).end();
            }
          });
        }
      });
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

router.get('/admin/listorganisms', permissions.requireGroup('admin'), function(req, res, next) {
  Organism.find(function(err, organisms) {
    if (err) {
      console.error('There is an error to access /listorganisms and get all the oragnisms, the error is : ' + err);
      res.render('a_listorganisms.jade', {
        error: err,
        session: req.session,
        admin: req.session.admin,
        group: req.session.group
      });
    } else {
      res.render('a_listorganisms.jade', {
        organisms: organisms,
        session: req.session,
        admin: req.session.admin,
        group: req.session.group
      });
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