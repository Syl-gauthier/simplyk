var express = require('express');
var router = express.Router();

var Organism = require('../models/organism_model.js');

router.get('/listorganisms', function(req, res) {
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

module.exports = router;