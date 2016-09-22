var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var gmaps = require('../middlewares/gmaps.js');
var sloter = require('../lib/slot.js');

var permissions = require('../middlewares/permissions.js');
var Organism = require('../models/organism_model.js');


router.get('/organism/addlongterm', permissions.requireGroup('organism'), function(req, res) {
	res.render('o_addlongterm.jade', {
		organism: req.session.organism
	});
});

router.post('/organism/addlongterm', permissions.requireGroup('organism'), function(req, res) {
	//Transform address into lon/lat
	console.log('address sent to gmaps: ' + req.body.address);

	gmaps.codeAddress(req.body.address, function(lat, lon) {
		if ('ZERO_RESULTS' === lat) {
			var error = 'La position de l\'adresse que vous avez mentionné n\'a pas été trouvé par Google Maps';
			res.render('o_addlongterm.jade', {
				error: error,
				organism: req.session.organism
			});
		} else {
			var slotString = sloter.createSlotString(req.body);
			const newLongterm = {
				intitule: req.body.title,
				description: req.body.description,
				address: req.body.address,
				lat: lat,
				lon: lon,
				expiration_date: req.body.expiration_date_submit,
				min_hours: req.body.min_hours,
				slot: slotString,
				vol_nb: req.body.vol_nb,
				language: req.body.language,
				min_age: req.body.min_age,
				antecedents: false,
				tags: '',
				applicants: []
			};
			Organism.findOneAndUpdate({
				'_id': req.session.organism._id
			}, {
				'$push': {
					'long_terms': newLongterm
				}
			}, {
				new: true
			}, function(err, organism) {
				if (err) {
					res.render('o_addlongterm.jade', {
						error: err,
						organism: req.session.organism
					});
				} else {
					req.session.organism = organism;
					res.sendStatus(200);
					res.redirect('/organism/dashboard');
				}
			});
		}
	});
});


module.exports = router;