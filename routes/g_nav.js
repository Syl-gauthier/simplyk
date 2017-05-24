'use strict';
const express = require('express');
const router = express.Router();

const Organism = require('../models/organism_model.js');
var Activity = require('../models/activity_model.js');
var Volunteer = require('../models/volunteer_model.js');

var emailer = require('../public/javascripts/email/emailer.js');
var rewindSlotString = require('../public/javascripts/dates/slot.js').rewindSlotString;

router.get('/listorganisms', function(req, res, next) {
  Organism.find({
    "school_id": {
      $exists: false
    },
    "validation": true,
    "cause": {
      $exists: true
    }
  }, function(err, organisms) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème pour obtenir la liste des organismes';
      next(err);
    } else {
      organisms.sort((a, b) => {
        return (b.events.length + b.long_terms.length) - (a.events.length + a.long_terms.length);
      });
      res.render('a_listorganisms.jade', {
        organisms: organisms,
        session: req.session,
        admin: req.session.admin,
        group: req.session.group
      });
    }
  })
});

router.get('/contact', function(req, res) {
  res.render('g_contact.jade', {
    session: req.session,
    admin: req.session.admin,
    group: req.session.group
  });
});

router.get('/us', function(req, res) {
  res.render('g_us.jade', {
    session: req.session,
    admin: req.session.admin,
    group: req.session.group
  });
});

router.get('/all/activity/:act_id', function(req, res, next) {
  console.log('In GET to an activity page with act_id:' + req.params.act_id);
  //Find organism corresponding to the activity
  if (req.session.volunteer) {
    res.redirect('/activity/' + req.params.act_id);
  } else {
    Activity.findById(req.params.act_id, function(err, activity) {
      if (err) {
        err.type = 'CRASH';
        err.print = 'Problème pour accéder aux informations du bénévolat';
        next(err);
      } else {
        if (activity) {
          Organism.find({
            "events.activities": req.params.act_id
          }, function(err, organism) {
            if (err) {
              err.type = 'CRASH';
              err.print = 'Problème pour accéder aux informations du bénévolat';
              next(err);
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
                group: req.session.group,
                organism: organism[0],
                activity: activity
              });
            }
          });
        } else {
          err.type = 'CRASH';
          err.print = 'Problème pour accéder aux informations du bénévolat';
          next(err);
        }
      }
    });
  }
});


router.get('/all/longterm/:lt_id', function(req, res, next) {
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
        err.type = 'CRASH';
        err.print = 'Problème pour accéder aux informations de ce bénévolat';
        next(err);
      } else {
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

router.get('/fr', function(req, res) {
  res.cookie('i18n', 'fr');
  let backUrl = req.header('Referer') || '/';
  if (backUrl && backUrl != '/fr' && backUrl != '/en') {
    res.redirect(backUrl);
  } else {
    res.redirect('/');
  }
});

router.get('/en', function(req, res) {
  res.cookie('i18n', 'en');
  let backUrl = req.header('Referer') || '/';
  if (backUrl && backUrl != '/fr' && backUrl != '/en') {
    res.redirect(backUrl);
  } else {
    res.redirect('/');
  }
});

router.get('/all/organism/:org_id', function(req, res, next) {
  console.log('In GET to a organism page with lt_id:' + req.params.org_id);
  let error = '';
  if (req.query.error) {
    error = req.query.error;
  }
  //Find organism corresponding to the activity
  Organism.findOne({
    "_id": req.params.org_id
  }, function(err, organism) {
    if (err) {
      err.type = 'CRASH';
      err.print = 'Problème pour accéder aux informations de cet organisme';
      next(err);
    } else {
      if (organism) {
        let activity_ids = new Array();
        organism.events.map(function(ev) {
          ev.activities.map(function(act) {
            activity_ids.push(act);
          })
        });
        console.log('activity_ids' + JSON.stringify(activity_ids));
        Activity.find({
          _id: {
            $in: activity_ids
          },
          archived: {
            $ne: true
          }
        }, function(err, activities) {
          if (err) {
            err.type = 'CRASH';
            err.print = 'Problème pour accéder aux informations de cet organisme';
            next(err);
          } else {
            let organism_to_send = JSON.parse(JSON.stringify(organism));
            organism_to_send.events.map(function(ev) {
              let ev_past = true;
              ev.activitiesFull = activities.filter(function(act) {
                return ev.activities.indexOf(act._id.toString()) > -1;
              });
              ev.activitiesFull.map(function(act) {
                act.days.map(function(day) {
                  if (day.day > Date.now()) {
                    act['past'] = false;
                    ev_past = false;
                  } else {
                    act['past'] = true;
                  };
                });
              });
              ev['past'] = ev_past;
            });
            organism_to_send.events.sort((a, b) => {
              if (a.past && !b.past) {
                return 1;
              } else if (!a.past && b.past) {
                return -1;
              } else {
                return 0;
              }
            });
            organism_to_send.long_terms = organism_to_send.long_terms.filter(lt => {
              return lt.tags != 'archived';
            })
            organism_to_send.long_terms.sort((a, b) => {
              return new Date(b.expiration_date).getTime() - new Date(a.expiration_date).getTime();
            });
            console.log(JSON.stringify(organism));
            res.render('g_organism.jade', {
              group: req.session.group,
              session: req.session,
              organism: organism_to_send,
              error
            });
          }
        });
      } else {
        err.type = 'CRASH';
        err.print = 'Problème pour accéder aux informations de cet organisme';
        next(err);
      }
    }
  });
});

router.get('/share/001:vol', function(req, res, next) {
  console.log('req.params.vol ' + req.params.vol);
  if (req.session.volunteer) {
    if (req.session.volunteer._id && (req.params.vol == req.session.volunteer._id)) {
      const cheat = encodeURIComponent('Tu ne peux pas partager Simplyk à toi même ! :)')
      res.redirect('/volunteer/map?error=' + cheat);
    } else {
      console.log('Second if');
      successShare();
    }
  } else {
    console.log('First if');
    successShare();
  }

  function successShare() {
    Volunteer.update({
      '_id': req.params.vol
    }, {
      $inc: {
        'shares': 1
      }
    }, function(err) {
      if (err) {
        err.type = 'MINOR';
        err.print = 'Problème pour accéder aux informations de ce bénévolat';
        next(err);
      }
      res.redirect('/');
    });
  }
})

router.post('/nexmo_inbound', function(req, res) {
  console.info('In nexmo_inbound : ' + JSON.stringify(req.body));
  var sms_content = {
    customMessage: JSON.stringify(req.body)
  };
  emailer.sendInboundSMSEmail(sms_content);
  res.status(200).end();
});

router.post('/nexmo_receipt', function(req, res) {
  console.info('In nexmo_receipt : ' + JSON.stringify(req.body));
  res.status(200).end();
});

module.exports = router;