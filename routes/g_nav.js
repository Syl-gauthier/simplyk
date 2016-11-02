var express = require('express');
var router = express.Router();

var Organism = require('../models/organism_model.js');

router.get('/listorganisms', function(req, res) {
	Organism.find(function(err, organisms) {
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

module.exports = router;