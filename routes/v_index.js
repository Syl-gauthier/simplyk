/*jslint node: true */

var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Organism = require('../models/organism_model.js');

var permissions = require('../middlewares/permissions.js');
var subscribe = require('../middlewares/subscribe.js');
var app = express();

/*GET map page*/
router.get('/volunteer/map', permissions.requireGroup('volunteer'), function(req, res) {
  Organism.find({}, 'events id org_name', function(err, organisms){
    if (err) {
      console.log(err);
      res.render('v_map.jade', {
        session: req.session,
        error: err
      });
    }
    //Create opps list
    else {
      console.log(req.isAuthenticated());
      console.log('**************');
      var activitiesList = [];
      //Add org_name and event details in the activities and create the list of all the activities
      for (var orgI = organisms.length - 1; orgI >= 0; orgI--) {
        for (var eventI = organisms[orgI].events.length - 1; eventI >= 0; eventI--) {
          for (var activityI = organisms[orgI].events[eventI].activities.length - 1; activityI >= 0; activityI--) {
            var activity = {
              intitule: organisms[orgI].events[eventI].activities[activityI].intitule,
              description: organisms[orgI].events[eventI].activities[activityI].description,
              min_hours: organisms[orgI].events[eventI].activities[activityI].min_hours,
              days: organisms[orgI].events[eventI].activities[activityI].days,
              org_id: organisms[orgI]._id,
              event_intitule: organisms[orgI].events[eventI].intitule,
              event_lat: organisms[orgI].events[eventI].lat,
              event_lon: organisms[orgI].events[eventI].lon,
              event_address: organisms[orgI].events[eventI].address,
              org_name: organisms[orgI].org_name,
              id: organisms[orgI].events[eventI].activities[activityI]._id
            };
            activitiesList.push(activity);
          }
        }
      }
      console.log('**************');
      console.log('activitiesList : '+JSON.stringify(activitiesList));
      console.log('**************');
      res.render('v_map.jade', {
        activities: activitiesList,
        volunteer: req.isAuthenticated()
      });
    }
  });
});


router.post('/volunteer/subscribe', function(req, res) {

  //Search events in DB
  Organism.findOne({'event.id': req.event_id}, function(err, event) {
    if (err) {
      console.log('Failure to find event');
      return handleError(err);
    }
    // fonction defined in ../middlewares/subscribe
    subscribe.subscribeUserToOpp(event, req.user, res);
  });
});


router.post('/volunteer/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
