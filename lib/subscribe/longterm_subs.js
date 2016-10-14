var express = require('express');
var Organism = require('../../models/organism_model.js');
var Volunteer = require('../../models/volunteer_model.js');
var emailer = require('../../email/emailer.js');

//Subscribe a volunteer to an organism long term
var subscribe = function(volunteer, longterm_id, callback) {
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
			var longtermS = newOrganism.long_terms.find(function(lt) {
				return lt._id == longterm_id;
			});
			var longtermJ = JSON.parse(JSON.stringify(longtermS));
			longtermJ['org_name'] = newOrganism.org_name;
			longtermJ['org_id'] = newOrganism._id;
			if (volunteer.student) {
				longtermJ['student_questions'] = ['À quel problème de fond répond cette action ?', 'Identifie une qualité du profil de l’apprenant que tu as développé au cours de cette activité et explique pourquoi.', 'Comment pourrais-tu prolonger ton expérience de bénévolat ?'];
				longtermJ['organism_questions'] = ['Quel point positif pouvez-vous mettre en avant sur l’élève, et qu’est-ce que l’élève pourrait améliorer ?'];
			};
			console.log('longtermJ after org_name and org_id addition : ' + JSON.stringify(longtermJ));
			Volunteer.findOneAndUpdate({
				'_id': volunteer._id
			}, {
				'$push': {
					'long_terms': longtermJ
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
						name: newOrganism.firstname + ' ' + newOrganism.lastname,
						customMessage: newVolunteer.firstname + ' ' + newVolunteer.lastname + ' s\'est inscrit à votre engagement ' + longtermJ.intitule + ' !<br>'
					};
					var volContent = {
						recipient: newVolunteer.email,
						button: {
							text: 'Voir mon profil',
							link: 'platform.simplyk.org'
						},
						firstname: newVolunteer.firstname,
						customMessage: ['Tu t\' es inscrit à l\'engagement de ' + newOrganism.org_name + ' : ' + longtermJ.intitule + ' !', ' N\'oublie pas d\'enregistrer tes heures de participation à cet engagement !', 'Cela bénéficiera à la fois à ' + newOrganism.org_name + ' et à toi pour passer aux échelons supérieurs de l\'engagement !'],
					};
					emailer.sendSubscriptionOrgEmail(orgContent);
					emailer.sendSubscriptionVolEmail(volContent);
					return callback(null, results);
				}
			})
		}
	});
};

module.exports = {
	subscribe: subscribe
};