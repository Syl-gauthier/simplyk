'use strict';
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var gmaps = require('../middlewares/gmaps.js');
var sloter = require('../lib/slot.js');
var Intercom = require('intercom-client');
var client = new Intercom.Client({
  token: process.env.INTERCOM_TOKEN
});

var permissions = require('../middlewares/permissions.js');
var Organism = require('../models/organism_model.js');


router.get('/organism/addlongterm', permissions.requireGroup('organism', 'admin'), function(req, res) {
	res.render('o_addlongterm.jade', {
		session: req.session,
		organism: req.session.organism,
		admin: req.session.admin,
		group: req.session.group
	});
});

router.post('/organism/addlongterm', permissions.requireGroup('organism', 'admin'), function(req, res) {
	//Transform address into lon/lat
	console.log('address sent to gmaps: ' + req.body.address);

	gmaps.codeAddress(req.body.address, function(lat, lon) {
		if ('ZERO_RESULTS' === lat) {
			var error = 'La position de l\'adresse que vous avez mentionné n\'a pas été trouvé par Google Maps';
			res.render('o_addlongterm.jade', {
				session: req.session,
				error: error,
				organism: req.session.organism,
				admin: req.session.admin,
				group: req.session.group
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
						session: req.session,
						error: err,
						organism: req.session.organism,
						admin: req.session.admin,
						group: req.session.group
					});
				} else {
					//Intercom create addlongterm event
					client.events.create({
						event_name: 'org_addlongterm',
						created_at: Math.round(Date.now() / 1000),
						user_id: organism._id
					});
					client.users.update({
						user_id: organism._id,
						update_last_request_at: true,
						custom_attributes: {
							longterm_name: newLongterm.intitule,
						}
					});
					req.session.organism = organism;
					res.redirect('/organism/dashboard');
				}
			});
		}
	});
});


module.exports = router;