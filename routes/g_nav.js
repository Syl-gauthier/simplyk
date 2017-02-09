'use strict';
const express = require('express');
const router = express.Router();

const Organism = require('../models/organism_model.js');
var Activity = require('../models/activity_model.js');
var rewindSlotString = require('../lib/slot.js').rewindSlotString;

router.get('/listorganisms', function(req, res) {
  Organism.find({
    "school_id": {
      $exists: false
    }
  }, function(err, organisms) {
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

router.get('/all/activity/:act_id', function(req, res) {
  console.log('In GET to an activity page with act_id:' + req.params.act_id);
  //Find organism corresponding to the activity
  if (req.session.volunteer) {
    res.redirect('/activity/' + req.params.act_id);
  } else {
    Activity.findById(req.params.act_id, function(err, activity) {
      Organism.find({
        "events.activities": req.params.act_id
      }, function(err, organism) {
        if (err) {
          console.log('ERROR : ' + err);
          res.redirect('/');
        } else {
          function isRightEvent(event) {
            return event.activities.indexOf(req.params.act_id) >= 0;
          };

          var event_filtered = organism[0].events.filter(isRightEvent);
          console.log('+++++++++++++++++++++');
          console.log('Event find in organism corresponding to act : ' + event_filtered)
          console.log('+++++++++++++++++++++');
          console.log('Activity : ' + activity);
          res.render('v_activity.jade', {
            act_id: req.params.act_id,
            event: event_filtered,
            organism: organism[0],
            activity: activity
          });
        }
      });
    });
  }
});


router.get('/all/longterm/:lt_id', function(req, res) {
  console.log('In GET to a longterm page with lt_id:' + req.params.lt_id);
  if (req.session.volunteer) {
    res.redirect('/longterm/' + req.params.lt_id);
  } else {
    let error = '';
    if (req.query.error) {
      error = req.query.error;
    }
    //Find organism corresponding to the activity
    Organism.findOne({
      "long_terms": {
        "$elemMatch": {
          "_id": req.params.lt_id
        }
      }
    }, function(err, organism) {
      if (err) {
        console.log(err);
        res.redirect('/');
      } else {
        console.log('Organism from longterm : ' + organism);

        function isRightLongterm(long) {
          console.log('long._id == req.params.lt_id : ' + (long._id.toString() == req.params.lt_id.toString()) + long._id + '  ' + req.params.lt_id)
          return long._id.toString() == req.params.lt_id.toString();
        };
        var longterm = organism.long_terms.find(isRightLongterm);
        console.log('+++++++++++++++++++++');
        console.log('Longterm found in organism corresponding to lt_id : ' + longterm)
        console.log('+++++++++++++++++++++');
        var slotJSON = rewindSlotString(longterm.slot);
        res.render('v_longterm.jade', {
          lt_id: req.params.lt_id,
          organism: organism,
          longterm: longterm,
          slotJSON: slotJSON,
          error
        });
      }
    });

  }
});


module.exports = router;