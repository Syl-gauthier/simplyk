var express = require('express');
var Organism = require('../../models/organism_model.js');
var Volunteer = require('../../models/volunteer_model.js');

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
					return callback(null, results);
				}
			})
		}
	});
};

module.exports = {
	subscribe: subscribe
};