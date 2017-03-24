'use strict';
var express = require('express');
var router = express.Router();
var emailer = require('../email/emailer.js');
var mongoose = require('mongoose');
var gmaps = require('../middlewares/gmaps.js');
var Intercom = require('intercom-client');
var client = new Intercom.Client({
  token: process.env.INTERCOM_TOKEN
});

var permissions = require('../middlewares/permissions.js');
var Organism = require('../models/organism_model.js');
var Activity = require('../models/activity_model.js');

router.get('/organism/addevent', permissions.requireGroup('organism', 'admin'), function(req, res) {
  const hash = require('intercom-client').SecureMode.userHash({
    secretKey: process.env.INTERCOM_SECRET_KEY,
    identifier: req.session.organism._id
  });
  res.render('o_addevent.jade', {
    session: req.session,
    organism: req.session.organism,
    group: req.session.group,
    hash
  });
});


router.post('/organism/addevent', permissions.requireGroup('organism', 'admin'), function(req, res, next) {
  //Transform address into lon/lat
  console.log('address sent to gmaps: ' + req.body.address);
  console.log('DATAS : event in addevent: ' + JSON.stringify(req.body));

  gmaps.codeAddress(req.body.address, function(lat, lon) {
    if ('ZERO_RESULTS' == lat) {
      var error = 'La position de l\'adresse que vous avez mentionné n\'a pas été trouvé par Google Maps';
      res.render('o_addevent.jade', {
        session: req.session,
        error: error,
        organism: req.session.organism,
        group: req.session.group
      });
    } else {
      Organism.findById(req.session.organism._id, function(err, organism) {
        //Verify min_age is a number
        let min_age = req.body.min_age;
        if (typeof min_age !== 'number') {
          min_age = parseInt(min_age.toString());
          console.info('min_age is not a number : ' + req.body.min_age + ' and now with parseInt : ' + min_age);
          if (isNaN(min_age)) {
            min_age = 26;
            console.info('parseInt didnt work so we put min_age : ' + min_age);
          }
          console.info('min_age == NaN : ' + min_age == NaN);
        }
        var keysList = Object.keys(req.body);
        var event = {
          intitule: req.body.intitule_event,
          dates: [],
          min_age,
          address: req.body.address,
          language: req.body.language,
          description: req.body.event_description,
          status: "",
          activities: [],
          lat: lat,
          lon: lon
        };
        //Days number calculated
        var nb_days = 0;
        var days_iterator = -1;
        do {
          nb_days++;
          var days_exists = false;
          for (var d = keysList.length - 1; d >= 0; d--) {
            if (keysList[d].search('day' + (nb_days + 1)) === 0) {
              days_exists = true;
            }
          };
        }
        while (days_exists);
        console.log('There are ' + nb_days + ' days in the event !');
        //Activities number calculated: nb_activities
        var nb_activities = 0;
        var activities_iterator = -1;
        do {
          nb_activities++;
          var activities_exists = false;
          for (var d = keysList.length - 1; d >= 0; d--) {
            if (keysList[d].search('activity' + (nb_activities + 1) + '_intitule_activity') === 0) {
              activities_exists = true;
            }
          };
        }
        while (activities_exists === true);
        console.log('There are ' + nb_activities + ' activities in the event !');
        //Create activities
        var activitiesList = [];
        var school_id = null;
        if (req.session.admin) {
          if (req.session.organism.school_id) {
            school_id = req.session.organism.school_id;
          } else if (req.session.organism.admin_id) {
            school_id = req.session.organism.admin_id;
          }
        };
        //Intercom create addevent event
        client.events.create({
          event_name: 'org_addevent',
          created_at: Math.round(Date.now() / 1000),
          user_id: organism._id,
          metadata: {
            event_name: req.body.intitule_event,
          }
        });
        client.users.update({
          user_id: organism._id,
          update_last_request_at: true
        });
        for (var i = 1; i < nb_activities + 1; i++) {
          var activity = {
            lat: lat,
            lon: lon,
            org_id: req.session.organism._id,
            org_name: req.session.organism.org_name,
            event_intitule: req.body.intitule_event,
            address: req.body.address,
            min_age: min_age,
            language: req.body.language,
            cause: req.session.organism.cause,
            email: req.session.organism.email,
            school_id: school_id,
            validation: req.session.organism.validation,
            intitule: req.body['activity' + i + '_intitule_activity'],
            description: req.body['activity' + i + '_activity_description'],
            min_hours: req.body['activity' + i + '_min_hours'],
            days: []
          };
          for (var j = 1; j < nb_days + 1; j++) {
            if (req.body['activity' + i + '_day' + j] === 'on') {
              var day = {
                start_time: req.body['activity' + i + '_day' + j + '_startTime'],
                end_time: req.body['activity' + i + '_day' + j + '_endTime'],
                vol_nb: req.body['activity' + i + '_day' + j + '_vol_nb'],
                day: req.body['day' + j + '_submit'],
                applications: []
              };
              event.dates.push(day.day);
              activity.days.push(day);
            };
          };
          //Create activity in Mongo
          const newActivity = new Activity(activity);
          newActivity.save(function(err, act) {
            if (err) {
              err.type = 'CRASH';
              err.print = 'Problème lors de la création du bénévolat : nous avons néanmoins récupérer les informations nécessaires. Vous pouvez soit nous envoyer un courriel, soit recommencer l\'opération';
              next(err);
            } else {
              console.log('++++++++++++++++++++++++++++++');
              console.log('ACT._ID' + act._id);
              event.activities.push(act._id);
              console.log('++++++++++++++++++++++++++++++');
              console.log('2 ++++++++++ activity : ' + i + JSON.stringify(activity));
              console.log('1 ++++++++ event : ' + JSON.stringify(event));
              const content = {
                recipient: req.session.organism.email,
                event_name: req.body.intitule_event,
                customMessage: ['L\'évènement ' + req.body.intitule_event + ' a été ajouté avec succès sur la plateforme Simplyk.', 'Comme vous pouvez le voir sur la carte, il est visible à l\'adresse : ' + req.body.address, 'Un courriel vous sera envoyé lorsqu\'un bénévole s\'inscrira, et vous serez alors invité à rentrer en contact avec lui !']
              };
              emailer.sendTransAddEvent(content);
              if (event.activities.length == nb_activities) {
                organism.events.push(event);
                organism.save(function(err, org) {
                  if (err) {
                    err.type = 'CRASH';
                    err.print = 'Problème lors de la création du bénévolat : nous avons néanmoins récupérer les informations nécessaires. Vous pouvez soit nous envoyer un courriel, soit recommencer l\'opération';
                    next(err);
                  } else {
                    req.session.organism = org;
                    req.session.save(function(err) {
                      if (err) {
                        err.type = 'MINOR';
                        next(err);
                        res.render('o_addevent.jade', {
                          session: req.session,
                          error: err,
                          organism: req.session.organism,
                          group: req.session.group
                        });
                      } else {
                        res.redirect('/organism/dashboard');
                      };
                    });
                  }
                });
              }
            }
          });
        };
      });
    }
  });
});

router.post('/test_address', function(req, res) {
  //Transform address into lon/lat
  console.log('address sent to gmaps: ' + req.body.address);
  const error = 'La position de l\'adresse que vous avez mentionné n\'a pas été trouvé par Google Maps';

  gmaps.codeAddress(req.body.address, function(lat, lon, string) {
    let response = {};
    if (lat == 'ZERO_RESULTS') {
      response.error = error;
      res.status(404).send(response);
      res.end();
    } else {
      response.ok = true;
      response.string = string;
      response.lat = lat;
      response.lon = lon;
      res.status(200).send(response);
      res.end();
    }
  });

});

module.exports = router;