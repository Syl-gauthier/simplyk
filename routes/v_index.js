var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var emailer = require('../email/emailer.js')

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Organism = require('../models/organism_model.js');
var Volunteer = require('../models/volunteer_model.js');
var Activity = require('../models/activity_model.js');

var permissions = require('../middlewares/permissions.js');
var subscribe = require('../middlewares/subscribe.js');
var finder = require('../middlewares/mongo_finder.js');
var app = express();

/*GET map page*/
router.get('/volunteer/map', permissions.requireGroup('volunteer'), function(req, res) {
  Activity.find({}, function(err, activities){
    if (err) {
      console.log(err);
      res.render('v_map.jade', {
        session: req.session,
        error: err,
        volunteer: req.session.volunteer
      });
    }
    //Create opps list
    else {
      console.log(req.isAuthenticated());
      var isNotPassed = function(activity){
        var days_length = activity.days.filter(function(day){
          return day.day > Date.now();
        });
        return days_length.length > 0;
      };
      const acts = activities.filter(isNotPassed);
      res.render('v_map.jade', {
        activities: acts,
        volunteer: req.session.volunteer, error: req.query.error, success: req.query.success
      });
    }
  });
});


router.get('/activity/:act_id', permissions.requireGroup('volunteer'), function(req,res){
  console.log('In GET to an activity page with act_id:' + req.params.act_id);
  //Find organism corresponding to the activity
  Activity.findById(req.params.act_id, function(err, activity){
    Organism.find({
      "events.activities": req.params.act_id
    }, function(err, organism){
      if (err) {
        console.log(err);
        res.redirect('/volunteer/map?error='+err);
      }
      else {
        console.log('Organism : ' + organism);
        console.log('Organism[0] : ' + organism[0]);
        console.log('Organism.events : ' + organism[0].events);
        function isRightEvent(event){
          return event.activities.indexOf(req.params.act_id) >= 0;
        };
        var event_filtered = organism[0].events.filter(isRightEvent);
        console.log('+++++++++++++++++++++');
        console.log('Event find in organism corresponding to act : ' + event_filtered)
        console.log('+++++++++++++++++++++');
        console.log('Activity : ' + activity);
        res.render('v_activity.jade', {act_id: req.params.act_id, event: event_filtered, organism: organism[0], activity: activity, volunteer: req.session.volunteer});
        res.end();
      }
    });
  });
});


router.post('/volunteer/subscribe/:act_id-:activity_day', permissions.requireGroup('volunteer'), function(req, res) {
  //Verify the volunteer is not already susbscribed to the activity
  function subscribeToActivity(student_q, organism_q){
    function isActivity(activity){
      console.log('Activity day : + ' + Date.parse(activity.day) + Date.parse(req.params.activity_day))
      return ((activity.activity_id.toString() === req.params.act_id) && (Date.parse(activity.day) === Date.parse(req.params.activity_day)));
    };
    var alreadyExists = req.session.volunteer.events.find(isActivity);
    console.log('alreadyExists : ' + alreadyExists + typeof alreadyExists);
    if(typeof alreadyExists === 'undefined'){
      console.log('Act_id which is searched : ' + req.params.act_id);
      console.log('req.params.activity_day : ' + req.params.activity_day);
      console.log('MODIFYING ACTIVITY');
      Activity.findOneAndUpdate({
        "$and": [{
          "_id": req.params.act_id
        },{
          "days.day": req.params.activity_day
        }]
      },{
        "$addToSet": {
          "days.$.applicants": req.session.volunteer._id
        }
      }, function(err, newActivity){
        if(err){
          console.log(err);
        }
        else{
          function isGoodDay(day){
            return (Date.parse(day.day) === Date.parse(req.params.activity_day));
          };
          console.log('Isgood day result : ' + newActivity.days.find(isGoodDay));
          Volunteer.findOneAndUpdate({
            "_id":req.session.volunteer._id
          },
          {
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
          }, {returnNewDocument : true, new: true}, function(err, newVolunteer){
            if (err){
              console.log(err);
            }
            else {
              console.log('**********************************');
              console.log('New Volunteer modified : ' + JSON.stringify(newVolunteer));
              console.log('**********************************');
              const dayString = new Date(req.params.activity_day).toLocaleDateString();
              console.log('day String ' + dayString);
              console.log('**********************************');
            //UPDATING REQ.SESSION.VOLUNTEER
            req.session.volunteer = newVolunteer;
            var success =  encodeURIComponent('Vous avez été inscrit à l\'activité avec succès !');
            Organism.findById(newActivity.org_id, function(err, organism){
              var content = {
                recipient: organism.email,
                name: organism.firstname + ' ' + organism.lastname,
                customMessage: req.session.volunteer.firstname + ' s\'est inscrit à votre activité ' + newActivity.intitule + ' de l\'évènement ' + newActivity.event_intitule + ' !'
              };
              emailer.sendSubscriptionEmail(content);
            });
            res.render('v_postsubscription.jade', {org_name: newActivity.org_name, day: dayString, start_time: newActivity.days.find(isGoodDay).start_time, end_time: newActivity.days.find(isGoodDay).end_time, address: newActivity.address, volunteer: req.session.volunteer});
            res.end();
          }
        })
        }
      });
    }
    else{
      console.log('Already subscribed to this event');
      var error = encodeURIComponent('Vous êtes déjà inscrit à cette activité !');
      res.redirect('/volunteer/map?error='+error);
      res.end();
    }
  };
  if(req.session.volunteer.student){
    const student_q = ['À quel problème de fond répond cette action ?', 'Identifie une qualité du profil de l’apprenant que tu as développé au cours de cette activité et explique pourquoi.', 'Comment pourrais-tu prolonger ton expérience de bénévolat ?'],
    organism_q = ['Quel point positif pouvez-vous mettre en avant sur l’élève, et qu’est-ce que l’élève pourrait améliorer ?'];
    subscribeToActivity(student_q, organism_q);
  }
  else {
    subscribeToActivity(null, null);
  }
});


router.post('/volunteer/unsubscribe', permissions.requireGroup('volunteer'), function(req, res) {
  subscribe.unsubscribeUserToAct(req, res);
});

router.get('/user', function(req, res){
  res.json(req.session.volunteer);
});

router.get('/volunteer/student_questions/:act_id-:act_day', permissions.requireGroup('volunteer'), function(req, res){
  if(!req.session.volunteer.student){res.redirect('/volunteer/map');}
  function alreadyAnswered(event){
    if(event.activity_id == req.params.act_id){
      if(event.student_answers.length){
        return true;
      }
      else{
        return false;
      }
    }
    return false;
  };
  function goodEvent(event){
    return ((event.activity_id == req.params.act_id) && (event.day == req.params.act_day));
  };
  var event_answered = req.session.volunteer.events.filter(alreadyAnswered);
  console.log('event_answered = ' + JSON.stringify(event_answered));
  console.log('event_answered.length = ' + event_answered.length);
  if (event_answered.length > 0){res.redirect('/volunteer/map');}
  else{
    var event = req.session.volunteer.events.find(goodEvent);
    Activity.findById(req.params.act_id, function(err, activity){
      res.render('v_questions.jade', {volunteer: req.session.volunteer, act_id: req.params.act_id, act_day: req.params.act_day, org_name: activity.org_name, event_intitule: activity.event_intitule, activity_intitule: activity.intitule, description: event.description_event, questions: event.student_questions});
    });
  };
});

router.post('/volunteer/student_questions', permissions.requireGroup('volunteer'), function(req, res){
  function isAKeyAnswer(key){
    return key.search('answer') != -1;
  };
  const student_answers_keys = Object.keys(req.body).filter(isAKeyAnswer);
  var student_answers = [];
  for (var key_i = student_answers_keys.length - 1; key_i >= 0; key_i--) {
    student_answers.push(req.body[student_answers_keys[key_i]]);
  };
  console.log('student_answers : ' + student_answers);
  Volunteer.findOneAndUpdate({
    "$and": [{
      "_id":req.session.volunteer._id
    },{
      "events":{
        '$elemMatch': {
          'activity_id': req.body.act_id,
          'day': req.body.act_day
        }
      }
    }]
  },
  {
    "$set": {
      "events.$.student_answers": student_answers
    }
  }, {returnNewDocument : true, new: true}, function(err, newVolunteer){
    if(err){
      console.log(err);
    }
    else{
      req.session.volunteer = newVolunteer;
      console.log('newVolunteer : ' +newVolunteer);
      console.log('newVolunteer === req.session.volunteer : ' + (req.session.volunteer ===newVolunteer));
      const message = 'Tes réponses ont bien été prises en compte'
      res.redirect('/volunteer/map?success='+message);
    }
  });
});

router.post('/volunteer/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;