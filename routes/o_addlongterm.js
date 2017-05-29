'use strict';
var express = require('express');
var router = express.Router();

var moment = require('moment');

var Intercom = require('intercom-client');
var client = new Intercom.Client({
	token: process.env.INTERCOM_TOKEN
});

var mongoose = require('mongoose');
var Organism = require('../models/organism_model.js');

var emailer = require('../public/javascripts/email/emailer.js');
var gmaps = require('../public/javascripts/geo/gmaps.js');
var sloter = require('../public/javascripts/dates/slot.js');
var agenda = require('../public/javascripts/agenda/agenda.js');

var permissions = require('../middlewares/permissions.js');

router.get('/organism/addlongterm', permissions.requireGroup('organism', 'admin'), function(req, res) {
	const hash = require('intercom-client').SecureMode.userHash({
		secretKey: process.env.INTERCOM_SECRET_KEY,
		identifier: req.session.organism._id
	});
	res.render('o_addlongterm.jade', {
		session: req.session,
		organism: req.session.organism,
		admin: req.session.admin,
		group: req.session.group,
		hash
	});
});

router.post('/organism/addlongterm', permissions.requireGroup('organism', 'admin'), function(req, res, next) {
	//Transform address into lon/lat
	console.log('address sent to gmaps: ' + req.body.address);
	console.log('DATAS : event in addlongterm: ' + JSON.stringify(req.body));

	//Verify min_age is a number
	let min_age = req.body.min_age;
	if (min_age && (typeof min_age !== 'number') && min_age != '') {
		min_age = parseInt(min_age.toString());
		console.info('min_age is not a number : ' + req.body.min_age + ' and now with parseInt : ' + min_age);
		if (isNaN(min_age)) {
			min_age = 26;
			console.info('parseInt didnt work so we put min_age : ' + min_age);
		}
		console.info('min_age == NaN : ' + min_age == NaN);
	}

	gmaps.codeAddress(req.body.address, function(lat, lon) {
		if (lat == 'ZERO_RESULTS' || lat == 'ERROR') {
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
				impact: req.body.impact,
				lat: lat,
				lon: lon,
				expiration_date: req.body.expiration_date_submit,
				slot: slotString,
				vol_nb: req.body.vol_nb,
				min_age,
				antecedents: false,
				tags: '',
				applicants: []
			};
			console.info('INFO : longterm created : ' + JSON.stringify(newLongterm));
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
					err.type = 'CRASH';
					err.print = 'Problème lors de la création du bénévolat : nous avons néanmoins récupérer les informations nécessaires. Vous pouvez soit nous envoyer un courriel, soit recommencer l\'opération';
					next(err);
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
					const content = {
						recipient: req.session.organism.email,
						longterm_name: req.body.title,
						customMessage: ['L\'engagement ' + req.body.title + ' a été ajouté avec succès sur la plateforme Simplyk.', 'Comme vous pouvez le voir sur la carte, il est visible à l\'adresse : ' + req.body.address, 'Un courriel vous sera envoyé lorsqu\'un bénévole s\'inscrira, et vous serez alors invité à rentrer en contact avec lui !']
					};
					emailer.sendTransAddLongTerm(content);
					//*************AGENDA
					console.info('req.body.expiration_date : ' + req.body.expiration_date);
					console.info('req.body.expiration_date != "" : ' + (req.body.expiration_date != ""));
					const longterm_to_send = organism.long_terms.find(function(lt) {
						return lt.description == newLongterm.description
					});
					console.info('longterm_to_send : ' + JSON.stringify(longterm_to_send));

					if (req.body.expiration_date != "") {
						let send_date = new Date(req.body.expiration_date_submit).getTime();
						send_date = moment(send_date).add(5, 'hours');
						const fiveDaysBefore = moment(send_date).add(-5, 'days');

						console.info('date when expiration date email will be sent : ' + moment(send_date).format('dddd D MMMM YYYY HH:mm'));
						console.info('date when 5 days before expiration date email will be sent : ' + moment(fiveDaysBefore).format('dddd D MMMM YYYY HH:mm'));

						agenda.schedule(moment(send_date).toDate(), 'longTermExpirationEmail', {
							lt_id: (longterm_to_send._id).toString(),
							lt_name: longterm_to_send.intitule,
							email: req.session.organism.email
						});

						agenda.schedule(moment(fiveDaysBefore).toDate(), 'fiveDaysLongTermExpirationEmail', {
							lt_id: (longterm_to_send._id).toString(),
							lt_name: longterm_to_send.intitule,
							email: req.session.organism.email
						});
					}

					req.session.organism = organism;
					req.session.save(function() {
						res.redirect('/organism/share_opp/longterm-' + (longterm_to_send._id).toString());
					});
				}
			});
		}
	});
});

module.exports = router;