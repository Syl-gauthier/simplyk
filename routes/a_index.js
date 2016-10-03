var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var permissions = require('../middlewares/permissions.js');
var Organism = require('../models/organism_model.js');
var Volunteer = require('../models/volunteer_model.js');


router.get('/admin/classes', permissions.requireGroup('admin'), function(req, res, next) {
  const student_ids = req.session.admin.students.map(function(el) {
    return el._id;
  });
  console.log('Import students to classes page ! ');
  console.log('student_ids : ' + student_ids);
  Volunteer.find({
    '_id': {
      '$in': student_ids
    }
  }, function(err, volunteers) {
    if (err) {
      console.log('There is an error to access /listorganisms and get all the volunteers, the error is : ' + err);
      res.render('a_classes.jade', {
        error: err,
        session: req.session,
        admin: req.session.admin,
        group: req.session.group
      });
    } else {
      var classes_array = [];
      volunteers.forEach(function(vol) {
        var classe = vol.admin.class;
        if (classes_array.indexOf(classe) > -1) {} else {
          classes_array.push(classe);
        }
      });
      res.render('a_classes.jade', {
        volunteers: volunteers,
        session: req.session,
        admin: req.session.admin,
        classes_array: classes_array,
        group: req.session.group
      });
    }
  })
});

router.get('/admin/report:vol_id', permissions.requireGroup('admin'), function(req, res, next) {
  Volunteer.findById(req.params.vol_id, function(err, volunteer) {
    if (err) {
      console.log('There is an error to access report, the error is : ' + err);
      res.render('a_classes.jade', {
        error: err,
        session: req.session,
        admin: req.session.admin,
        group: req.session.group
      });
    } else {
      var formatted_events = volunteer.events;
      for (var i = 0; i < formatted_events.length; i++) {
        for (var k = 0; k < formatted_events.length; k++) {
          console.log('formatted_events[i].activity_id : ' + formatted_events[i].activity_id);
          console.log('formatted_events[k].activity_id : ' + formatted_events[k].activity_id);
          console.log('formatted_events[i].activity_id == formatted_events[k].activity_id : ' + (formatted_events[i].activity_id == formatted_events[k].activity_id));
          if (formatted_events[i].activity_id.toString() == formatted_events[k].activity_id.toString()) {
            console.log('formatted_events[i].status != \'gathered\' && formatted_events[i]!=formatted_events[k] : ' + ((formatted_events[i].status != 'gathered') && (formatted_events[i] != formatted_events[k])));
            if ((formatted_events[i].status != 'gathered') && (formatted_events[i] != formatted_events[k])) {
              console.log('2 events to gather !');
              console.log('formatted_events[i] : ' + formatted_events[i]);
              console.log('formatted_events[k] : ' + formatted_events[k]);
              formatted_events[i].hours_done += formatted_events[k].hours_done;
              formatted_events[i].hours_pending += formatted_events[k].hours_pending;
              if (formatted_events[i].student_answers.length > formatted_events[k].student_answers.length) {} else if (formatted_events[i].student_answers.length < formatted_events[k].student_answers.length) {
                formatted_events[i].student_answers = formatted_events[k].student_answers;
              } else {};
              formatted_events[k].status = 'gathered';
            }
          }
        }
      };
      res.render('a_report.jade', {
        volunteer: volunteer,
        events: formatted_events,
        group: req.session.group
      });
    }
  });
});

router.get('/admin/feedback', permissions.requireGroup('admin'), function(req, res, next) {
  res.render('a_feedback.jade', {
    session: req.session,
    admin: req.session.admin,
    group: req.session.group
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
      console.log('There is an error to access /listorganisms and get all the oragnisms, the error is : ' + err);
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
  console.log('Begin get /profile')
  res.render('a_profile.jade', {
    admin: req.session.admin,
    session: req.session,
    group: req.session.group
  });
});

module.exports = router;