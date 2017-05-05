var express = require('express');
var Organism = require('../../models/organism_model.js');
var Volunteer = require('../../models/volunteer_model.js');
var emailer = require('../../email/emailer.js');
var schools_res = require('../../res/schools_res.js');

//Subscribe a volunteer to an organism long term
var subscribe = function(volunteer, longterm_id, hostname, phone, res, callback) {
	console.log('Begin subscription process');
	Organism.findOneAndUpdate({
		'long_terms': {
			'$elemMatch': {
				'_id': longterm_id
			}
		}
	}, {
		'$push': {
			'long_terms.$.applicants': volunteer._id
		}
	}, {
		new: true
	}, function(err, newOrganism) {
		if (err) {
			return callback(err, null);
		} else {
			function updateVolunteer(longterm) {
				Volunteer.findOneAndUpdate({
					'_id': volunteer._id
				}, {
					'$push': {
						'long_terms': longterm
					},
					'$set': {
						'phone': phone
					}
				}, {
					new: true
				}, function(err, newVolunteer) {
					if (err) {
						return callback(err, null);
					} else {
						console.log('subscription in mongo finished');
						const results = {
							newVolunteer: newVolunteer,
							newOrganism: newOrganism
						};
						var orgContent = {
							recipient: newOrganism.email,
							event: longterm.intitule,
							name: newOrganism.firstname + ' ' + newOrganism.lastname,
							link: 'http://' + hostname + '/organism/longterm/' + longterm_id,
							customMessage: [newVolunteer.firstname + ' ' + newVolunteer.lastname + ' s\'est inscrit à votre engagement ' + longterm.intitule + ' !', newVolunteer.firstname + ' attend un appel de votre part au ' + newVolunteer.phone + ' ou un courriel à l\'adresse ' + newVolunteer.email + '.', 'Contactez le au plus vite pour éviter qu\'il ne se décourage :)']
						};
						if (newVolunteer.admin.school_id && newVolunteer.admin.school_name) {
							orgContent.customMessage = [newVolunteer.firstname + ' ' + newVolunteer.lastname + ', élève à ' + newVolunteer.admin.school_name + ', s\'est inscrit à votre engagement ' + longterm.intitule + ' !', newVolunteer.firstname + ' attend un appel de votre part au ' + newVolunteer.phone + ' ou un courriel à l\'adresse ' + newVolunteer.email + '.', 'Contactez le au plus vite pour éviter qu\'il ne se décourage :)']
						}
						var volContent = {
							res,
							recipient: newVolunteer.email,
							firstname: newVolunteer.firstname,
							customMessage: ['Tu es maintenant inscrit à l\'engagement de ' + newOrganism.org_name + ' : ' + longterm.intitule + '. ', 'L\'organisme et toi devez entrer en contact. Tu peux les appeler via ' + newOrganism.firstname + ' ' + newOrganism.lastname + ' au ' + newOrganism.phone + ' ou leur envoyer un courriel au ' + newOrganism.email + '. ', 'Au cours de ton bénévolat, tu pourras ajouter des heures d\'engagement à ton profil sur la plateforme pour faire progresser ton profil de citoyen engagé !'],
						};
						emailer.sendSubscriptionOrgEmail(orgContent);
						emailer.sendSubscriptionVolEmail(volContent);
						return callback(null, results);
					}
				});
			};

			var longtermS = newOrganism.long_terms.find(function(lt) {
				return lt._id.toString() == longterm_id.toString();
			});
			var longtermJ = JSON.parse(JSON.stringify(longtermS));
			longtermJ['org_name'] = newOrganism.org_name;
			longtermJ['org_id'] = newOrganism._id;
			longtermJ['last_interaction'] = new Date();
			if (volunteer.admin && volunteer.admin.school_id) {
				schools_res.getQuestions(volunteer.admin, function(questions) {
					longtermJ['student_questions'] = questions.student_questions;
					longtermJ['organism_questions'] = questions.organism_questions;
					updateVolunteer(longtermJ);
				});
			} else {
				console.log('longtermJ after org_name and org_id addition : ' + JSON.stringify(longtermJ));
				updateVolunteer(longtermJ);
			};

		}
	});
};

module.exports = {
	subscribe: subscribe
};