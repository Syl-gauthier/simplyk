var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var permissions = require('../middlewares/permissions.js');
var Organism = require('../models/organism_model.js');


router.get('/admin/classes', permissions.requireGroup('admin'), function(req, res, next) {
  res.render('a_classes.jade', {session: req.session, admin: req.isAuthenticated()});
});

router.get('/admin/classexample', permissions.requireGroup('admin'), function(req, res, next) {
  res.render('a_classexample.jade', {session: req.session, admin: req.isAuthenticated()});
});

router.get('/admin/dashboard', permissions.requireGroup('admin'), function(req, res, next) {
  res.render('a_dashboard.jade', {session: req.session, admin: req.isAuthenticated()});
});

router.get('/admin/dashboard2', permissions.requireGroup('volunteer'), function(req, res, next) {
  res.render('a_dashboard2.jade', {session: req.session, admin: req.isAuthenticated()});
});

router.get('/admin/feedback', permissions.requireGroup('admin'), function(req, res, next) {
  res.render('a_feedback.jade', {session: req.session, admin: req.isAuthenticated()});
});

router.get('/admin/internopps', permissions.requireGroup('admin'), function(req, res, next) {
  res.render('a_internopps.jade', {session: req.session, admin: req.isAuthenticated()});
});

router.get('/admin/studentexample', permissions.requireGroup('admin'), function(req, res, next) {
  res.render('a_studentexample.jade', {session: req.session, admin: req.isAuthenticated()});
});

router.get('/admin/listorganisms', permissions.requireGroup('admin'), function(req, res, next) {
	Organism.find(function(err, organisms){
		if(err){
			console.log('There is an error to access /listorganisms and get all the oragnisms, the error is : ' + err);
			res.render('a_listorganisms.jade', {error: err, session: req.session, admin: req.isAuthenticated()});
		}
		else{
			res.render('a_listorganisms.jade', {organisms: organisms, session: req.session, admin: req.isAuthenticated()});
		}
	})
});

router.get('/admin/profile', permissions.requireGroup('admin'), function(req,res){
  console.log('Begin get /profile')
  res.json(req.session.admin);
});

router.post('/admin/logout', function(req, res){
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
