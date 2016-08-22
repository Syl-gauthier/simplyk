var express = require('express');
var router = express.Router();


var permissions = require('../middlewares/permissions.js');
var Volunteer = require('../models/volunteer_model.js');
var Organism = require('../models/organism_model.js');



router.get('/volunteer/profile', permissions.requireGroup('volunteer'), function(req,res){
	console.log('Begin get /profile')
	console.log(req.session.volunteer);
  var events_past = [];
  var events_pending = [];
  var events_subscribed = [];
  var events_confirmed = [];
  var error;
  for (var eventI = req.session.volunteer.events.length - 1; eventI >= 0; eventI--) {
    if(Date.parse(req.session.volunteer.events[eventI].day)<Date.now() && req.session.volunteer.events[eventI].hours_pending===0){
      req.session.volunteer.events[eventI].status = 'past';
      events_past.push(req.session.volunteer.events[eventI]);
    }
    else if(Date.parse(req.session.volunteer.events[eventI].day)>Date.now()){
      req.session.volunteer.events[eventI].status = 'subscribed';
      events_subscribed.push(req.session.volunteer.events[eventI]);
    }
    else if (Date.parse(req.session.volunteer.events[eventI].day)<Date.now() && req.session.volunteer.events[eventI].status==='pending'){
      events_pending.push(req.session.volunteer.events[eventI]);
    }
    else if (Date.parse(req.session.volunteer.events[eventI].day)<Date.now() && req.session.volunteer.events[eventI].status==='confirmed'){
      events_confirmed.push(req.session.volunteer.events[eventI]);
    }
    else {
      error = 'Une erreur avec vos inscriptions';
      console.log(error);
    }
  }
  res.render('v_profile.jade', {events_subscribed: events_subscribed, events_confirmed: events_confirmed, events_pending: events_pending, events_past: events_past, volunteer: req.session.volunteer, error: error});
});

router.post('/volunteer/editPassword', function(req, res) {
  //Contains current, new and confirm password
  var passwords = req.body;

  //Check for validity of password and coherence between new and confirm
  if (!req.user.validPassword(passwords.current) || passwords.new != passwords.confirm) {
    res.send({
      success: false,
      err: "blabla"
    });
  } else {
    req.user.password = req.user.generateHash(passwords.new);
    req.user.save(function(err) {
      res.send({
        success: true
      });
    });
  }
});

//Add hours_pending to an activity
router.post('/volunteer/hours_pending/:act_id-:day', permissions.requireGroup('volunteer'), function(req, res){
  var status = "pending";
  Volunteer.findOneAndUpdate({
    "$and": [{
      "_id":req.session.volunteer._id
    },{
      "events":{
        '$elemMatch': {
          'activity_id': req.params.act_id,
          'day': req.params.day
        }
      }
    }]
  },
  {
    "$set": {
      "events.$.hours_pending": req.body.hours_pending,
      "events.$.status": status
    }
  }, {returnNewDocument : true, new: true}, function(err, newVolunteer){
    if(err){
      console.log(err);
    }
    else {
      req.session.volunteer = newVolunteer;
      Organism.update({
        "$and": [{
          "events":{
            "$elemMatch": {
              "activities": {
                "$elemMatch": {
                  "_id": req.params.act_id
                }
              }
            }
          }
        },{
          "events":{
            "$elemMatch": {
              "activities": {
                "$elemMatch": {
                  "days": {
                    "$elemMatch": {
                      "day": req.params.day
                    }
                  }
                }
              }
            }
          }
        },{
          "events":{
            "$elemMatch": {
              "activities": {
                "$elemMatch": {
                  "days": {
                    "$elemMatch": {
                      "applications": {
                        "$elemMatch": {
                          "applicant_id": req.session.volunteer._id
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }]
      },
      {

      }
      );
      //res.json({volunteer: newVolunteer, hours_pending: req.body.hours_pending});
      res.redirect('/volunteer/map')
    }
  });
});

module.exports = router;
