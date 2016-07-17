/*jslint node: true */

var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Opp = require('../models/opp_model.js');

var permissions = require('../middlewares/permissions.js');
var subscribe = require('../middlewares/subscribe.js');
var app = express();

/*GET map page*/
router.get('/volunteer/map', permissions.requireGroup('volunteer'), function(req, res) {
  Opp.find({}, function(err, opps) {
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
        opps: opps,
        volunteer: req.isAuthenticated()
      });
    }
  });
});

router.post('/volunteer/subscribe', function(req, res) {

    subscribe.subscribeUserToOpp(req, res);

});

router.post('/volunteer/unsubscribe', function(req, res) {

    subscribe.unsubscribeUserToOpp(req, res);

});

router.post('/volunteer/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
