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
  Organism.find({}, 'events', function(err, events){
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
      res.render('v_map.jade', {
        opps: events,
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
