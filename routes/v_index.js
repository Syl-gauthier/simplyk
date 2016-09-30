var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var emailer = require('../email/emailer.js');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Organism = require('../models/organism_model.js');
var Volunteer = require('../models/volunteer_model.js');
var Activity = require('../models/activity_model.js');

var permissions = require('../middlewares/permissions.js');
var subscribe = require('../middlewares/subscribe.js');
var finder = require('../middlewares/mongo_finder.js');
var longtermsList = require('../lib/longterms.js').listFromOrganisms;
var rewindSlotString = require('../lib/slot.js').rewindSlotString;
var ltSubs = require('../lib/subscribe/longterm_subs.js');
var app = express();

/*GET map page*/
router.get('/volunteer/map', permissions.requireGroup('volunteer'), function(req, res) {
  Activity.find({}, function(err, activities) {
    if (err) {
      console.log(err);
      res.render('v_map.jade', {
        session: req.session,
        error: err,
        volunteer: req.session.volunteer
      });
    } else { //Create opps list
      const age = getAge(req.session.volunteer.birthdate);
      console.log('Volunteer age : ' + age);
      var isTooYoung = function(activity) {
        if (activity.min_age) {
          return (activity.min_age <= age);
        } else {
          return true;
        }
      };
      var isNotPassed = function(activity) {
        var days_length = activity.days.filter(function(day) {
          return day.day > Date.now();
        });
        return days_length.length > 0;
      };
      var isUnverified = function(activity) {
        return activity.validation;
      };
      //If user is under 16, he can't see the activities of unverified organisms
      if (age < 16) {
        var acts = activities.filter(isNotPassed).filter(isTooYoung).filter(isUnverified);
      } else {
        var acts = activities.filter(isNotPassed).filter(isTooYoung);
      }
      Organism.find({
        'long_terms': {
          '$exists': true,
          '$not': {
            '$size': 0
          }
        }
      }, {
        'org_name': true,
        '_id': true,
        'cause': true,
        'long_terms': true
      }, function(err, organisms) {
        if (err) {
          console.log(err);
          res.render('v_map.jade', {
            session: req.session,
            error: err,
            organism: req.session.organism
          });
        } else {
          var longterms = longtermsList(organisms);
          console.log('LONG' + organisms);
          res.render('v_map.jade', {
            activities: acts,
            volunteer: req.session.volunteer,
            error: req.query.error,
            longterms: longterms,
            success: req.query.success
          });
        }
      });
    }
  });
});


router.get('/activity/:act_id', permissions.requireGroup('volunteer'), function(req, res) {
  console.log('In GET to an activity page with act_id:' + req.params.act_id);
  //Find organism corresponding to the activity
  Activity.findById(req.params.act_id, function(err, activity) {
    Organism.find({
      "events.activities": req.params.act_id
    }, function(err, organism) {
      if (err) {
        console.log(err);
        res.redirect('/volunteer/map?error=' + err);
      } else {
        console.log('Organism : ' + organism);
        console.log('Organism[0] : ' + organism[0]);
        console.log('Organism.events : ' + organism[0].events);

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
          activity: activity,
          volunteer: req.session.volunteer
        });
        res.end();
      }
    });
  });
});


router.get('/longterm/:lt_id', permissions.requireGroup('volunteer'), function(req, res) {
  console.log('In GET to a longterm page with lt_id:' + req.params.lt_id);
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
      res.redirect('/volunteer/map?error=' + err);
    } else {
      console.log('Organism from longterm : ' + organism);

      function isRightLongterm(long) {
        console.log('long._id == req.params.lt_id : ' + (long._id == req.params.lt_id) + long._id + '  ' + req.params.lt_id)
        return long._id == req.params.lt_id;
      };
      var longterm = organism.long_terms.find(isRightLongterm);
      console.log('+++++++++++++++++++++');
      console.log('Longterm found in organism corresponding to lt_id : ' + longterm)
      console.log('+++++++++++++++++++++');
      var slotJSON = rewindSlotString(longterm.slot);
      const alreadySubscribed = longterm.applicants.find(function(app) {
        return app == req.session.volunteer._id;
      });
      const longtTermInVolunteer = req.session.volunteer.long_terms.find(function(lt) {
        console.log('longterm._id : ' + longterm._id);
        console.log('lt._id : ' + lt._id);
        return longterm._id == lt._id
      });
      console.log('longtTermInVolunteer : ' + longtTermInVolunteer);
      if (longtTermInVolunteer) {
        var hours_pending = longtTermInVolunteer.hours_pending;
        var hours_done = longtTermInVolunteer.hours_done;
        console.log('hours_done : ' + hours_done);
        console.log('hours_pending : ' + hours_pending);
      } else {
        var hours_pending = null;
        var hours_done = null;
      };
      res.render('v_longterm.jade', {
        lt_id: req.params.lt_id,
        organism: organism,
        longterm: longterm,
        volunteer: req.session.volunteer,
        slotJSON: slotJSON,
        alreadySubscribed: alreadySubscribed,
        hours_done: hours_done,
        hours_pending: hours_pending
      });
      res.end();
    }
  });
});


router.post('/volunteer/event/subscribe/:act_id-:activity_day', permissions.requireGroup('volunteer'), function(req, res) {
  //Verify the volunteer is not already susbscribed to the activity
  function subscribeToActivity(student_q, organism_q) {
    function isActivity(activity) {
      console.log('Activity day : + ' + Date.parse(activity.day) + Date.parse(req.params.activity_day))
      return ((activity.activity_id.toString() === req.params.act_id) && (Date.parse(activity.day) === Date.parse(req.params.activity_day)));
    };
    var alreadyExists = req.session.volunteer.events.find(isActivity);
    console.log('alreadyExists : ' + alreadyExists + typeof alreadyExists);
    if (typeof alreadyExists === 'undefined') {
      console.log('Act_id which is searched : ' + req.params.act_id);
      console.log('req.params.activity_day : ' + req.params.activity_day);
      console.log('MODIFYING ACTIVITY');
      Activity.findOneAndUpdate({
        "$and": [{
          "_id": req.params.act_id
        }, {
          "days.day": req.params.activity_day
        }]
      }, {
        "$addToSet": {
          "days.$.applicants": req.session.volunteer._id
        }
      }, function(err, newActivity) {
        if (err) {
          console.log(err);
        } else {
          function isGoodDay(day) {
            return (Date.parse(day.day) === Date.parse(req.params.activity_day));
          };
          console.log('Isgood day result : ' + newActivity.days.find(isGoodDay));
          Volunteer.findOneAndUpdate({
            "_id": req.session.volunteer._id
          }, {
            "$addToSet": {
              "events": {
                "activity_id": req.params.act_id,
                "intitule": newActivity.event_intitule,
                "address": newActivity.address,
                "lat": newActivity.lat,
                "lon": newActivity.lon,
                "day": req.params.activity_day,
                "intitule_activity": newActivity.description,
                "org_id": newActivity.org_id,
                "org_name": newActivity.org_name,
                "start_time": newActivity.days.find(isGoodDay).start_time,
                "end_time": newActivity.days.find(isGoodDay).end_time,
                "email": newActivity.email,
                "hours_done": 0,
                "status": 'subscribed',
                "hours_pending": 0,
                "student_questions": student_q,
                "student_answers": [],
                "organism_questions": organism_q,
                "organism_answers": []
              }
            }
          }, {
            returnNewDocument: true,
            new: true
          }, function(err, newVolunteer) {
            if (err) {
              console.log(err);
            } else {
              console.log('**********************************');
              console.log('New Volunteer modified : ' + JSON.stringify(newVolunteer));
              console.log('**********************************');
              const dayString = new Date(req.params.activity_day).toLocaleDateString();
              console.log('day String ' + dayString);
              console.log('**********************************');
              //UPDATING REQ.SESSION.VOLUNTEER
              req.session.volunteer = newVolunteer;
              var success = encodeURIComponent('Vous avez été inscrit à l\'activité avec succès !');
              Organism.findById(newActivity.org_id, function(err, organism) {
                var content = {
                  recipient: organism.email,
                  name: organism.firstname + ' ' + organism.lastname,
                  customMessage: req.session.volunteer.firstname + ' s\'est inscrit à votre activité ' + newActivity.intitule + ' de l\'évènement ' + newActivity.event_intitule + ' !'
                };
                emailer.sendSubscriptionEmail(content);
              });
              res.render('v_postsubscription.jade', {
                org_name: newActivity.org_name,
                day: dayString,
                start_time: newActivity.days.find(isGoodDay).start_time,
                end_time: newActivity.days.find(isGoodDay).end_time,
                address: newActivity.address,
                volunteer: req.session.volunteer
              });
              res.end();
            }
          })
        }
      });
    } else {
      console.log('Already subscribed to this event');
      var error = encodeURIComponent('Vous êtes déjà inscrit à cette activité !');
      res.redirect('/volunteer/map?error=' + error);
      res.end();
    }
  };
  if (req.session.volunteer.student) {
    const student_q = ['À quel problème de fond répond cette action ?', 'Identifie une qualité du profil de l’apprenant que tu as développé au cours de cette activité et explique pourquoi.', 'Comment pourrais-tu prolonger ton expérience de bénévolat ?'],
      organism_q = ['Quel point positif pouvez-vous mettre en avant sur l’élève, et qu’est-ce que l’élève pourrait améliorer ?'];
    subscribeToActivity(student_q, organism_q);
  } else {
    subscribeToActivity(null, null);
  }
});

router.post('/volunteer/longterm/subscribe/:lt_id', permissions.requireGroup('volunteer'), function(req, res) {
  console.log('lt_id : ' + req.params.lt_id + typeof req.params.lt_id);

  function isLongterm(lt) {
    return (lt._id === req.params.lt_id);
  };
  var alreadyExists = req.session.volunteer.long_terms.find(isLongterm);
  console.log('alreadyExists : ' + alreadyExists + typeof alreadyExists);
  if (typeof alreadyExists === 'undefined') {
    ltSubs.subscribe(req.session.volunteer, req.params.lt_id, function(err, results) {
      if (err) {
        console.log(err);
        res.redirect('/volunteer/map?error=' + err);
      } else {
        req.session.volunteer = results.newVolunteer;
        res.render('v_postsubscription.jade', {
          org_name: results.newOrganism.org_name,
          email: results.newOrganism.email,
          volunteer: req.session.volunteer
        });
      }
    });
  } else {
    console.log('Already subscribed to this long_term');
    var error = encodeURIComponent('Vous êtes déjà inscrit à cet engagement !');
    res.redirect('/volunteer/map?error=' + error);
    res.end();
  }
});

router.get('/user', function(req, res) {
  res.json(req.session.volunteer);
});

router.get('/volunteer/student_questions/:act_id-:act_day', permissions.requireGroup('volunteer'), function(req, res) {
  if (!req.session.volunteer.student) {
    res.redirect('/volunteer/map');
  }

  function alreadyAnswered(event) {
    if (event.activity_id == req.params.act_id) {
      if (event.student_answers.length) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  };

  function goodEvent(event) {
    return ((event.activity_id == req.params.act_id) && (event.day == req.params.act_day));
  };
  var event_answered = req.session.volunteer.events.filter(alreadyAnswered);
  console.log('event_answered = ' + JSON.stringify(event_answered));
  console.log('event_answered.length = ' + event_answered.length);
  if (event_answered.length > 0) {
    res.redirect('/volunteer/map');
  } else {
    var event = req.session.volunteer.events.find(goodEvent);
    Activity.findById(req.params.act_id, function(err, activity) {
      res.render('v_questions.jade', {
        volunteer: req.session.volunteer,
        act_id: req.params.act_id,
        act_day: req.params.act_day,
        org_name: activity.org_name,
        event_intitule: activity.event_intitule,
        activity_intitule: activity.intitule,
        description: event.description_event,
        questions: event.student_questions
      });
    });
  };
});

router.get('/volunteer/student_questions/:lt_id', permissions.requireGroup('volunteer'), function(req, res) {
  if (!req.session.volunteer.student) {
    res.redirect('/volunteer/map');
  }

  function alreadyAnswered(lt) {
    if (lt._id == req.params.lt_id) {
      if (lt.student_answers.length) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  };

  function goodLongterm(lt) {
    return (lt._id == req.params.lt_id);
  };
  var lt_answered = req.session.volunteer.long_terms.filter(alreadyAnswered);
  var longterm = req.session.volunteer.long_terms.find(goodLongterm);
  console.log('lt_answered = ' + JSON.stringify(lt_answered));
  console.log('lt_answered.length = ' + lt_answered.length);
  if (lt_answered.length > 0) {
    res.redirect('/volunteer/map');
  } else {
    res.render('v_questions.jade', {
      volunteer: req.session.volunteer,
      longterm: longterm,
      org_name: longterm.org_name,
      questions: longterm.student_questions
    });
  };
});

router.post('/volunteer/student_questions', permissions.requireGroup('volunteer'), function(req, res) {
  function isAKeyAnswer(key) {
    return key.search('answer') != -1;
  };
  const student_answers_keys = Object.keys(req.body).filter(isAKeyAnswer);
  var student_answers = [];
  for (var key_i = student_answers_keys.length - 1; key_i >= 0; key_i--) {
    student_answers.push(req.body[student_answers_keys[key_i]]);
  };
  console.log('student_answers : ' + student_answers);
  console.log('JSON.stringify(req.body) : ' + JSON.stringify(req.body));
  if (typeof req.body.act_id !== 'undefined') {
    console.log('We define query and update for an activity !');
    var query = {
      '_id': req.session.volunteer._id,
      'events': {
        '$elemMatch': {
          'activity_id': req.body.act_id,
          'day': req.body.act_day
        }
      }
    };
    var update = {
      '$set': {
        'events.$.student_answers': student_answers
      }
    };
  } else if (typeof req.body.lt_id !== 'undefined') {
    console.log('We define query and update for a lt !');
    var query = {
      '_id': req.session.volunteer._id,
      'long_terms': {
        '$elemMatch': {
          '_id': req.body.lt_id
        }
      }
    };
    var update = {
      '$set': {
        'long_terms.$.student_answers': student_answers
      }
    };
  };
  console.log('update : ' + JSON.stringify(update));
  console.log('query : ' + JSON.stringify(query));
  Volunteer.findOneAndUpdate(query, update, {
    returnNewDocument: true,
    new: true
  }, function(err, newVolunteer) {
    if (err) {
      console.log(err);
      res.redirect('/volunteer/map?error=' + err);
    } else {
      req.session.volunteer = newVolunteer;
      console.log('newVolunteer : ' + newVolunteer);
      console.log('newVolunteer === req.session.volunteer : ' + (req.session.volunteer === newVolunteer));
      const message = encodeURIComponent('Tes réponses ont bien été prises en compte');
      res.redirect('/volunteer/map?success=' + message);
    }
  });
});

router.post('/volunteer/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});


function getAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

module.exports = router;