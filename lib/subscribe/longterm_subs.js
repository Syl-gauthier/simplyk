var express = require('express');
var Organism = require('../../models/organism_model.js');
var Volunteer = require('../../models/volunteer_model.js');
var emailer = require('../../email/emailer.js');

//Subscribe a volunteer to an organism long term
var subscribe = function(volunteer, longterm_id, hostname, phone, callback) {
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
				return lt._id.toString() == longterm_id.toString();
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
						event: longtermJ.intitule,
						name: newOrganism.firstname + ' ' + newOrganism.lastname,
						link: 'http://' + hostname + '/organism/longterm/' + longterm_id,
						customMessage: [newVolunteer.firstname + ' ' + newVolunteer.lastname + ' s\'est inscrit à votre engagement ' + longtermJ.intitule + ' !', newVolunteer.firstname + ' attend un appel de votre part au ' + newVolunteer.phone + ' ou un courriel à l\'adresse ' + newVolunteer.email + '.', 'Contactez le au plus vite pour éviter qu\'il ne se décourage :)']
					};
					var volContent = {
						recipient: newVolunteer.email,
						firstname: newVolunteer.firstname,
						customMessage: ['Tu es maintenant inscrit à l\'engagement de ' + newOrganism.org_name + ' : ' + longtermJ.intitule + '. ', 'L\'organisme est supposé entrer en contact avec toi mais tu peux aussi appeler ' + newOrganism.firstname + ' ' + newOrganism.lastname + ' au ' + newOrganism.phone + '. ', 'Au cours de ton bénévolat, tu pourras ajouter des heures d\'engagement à ton profil sur la plateforme pour faire progresser ton profil de citoyen engagé !'],
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