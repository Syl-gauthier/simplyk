var express = require('express');

//Create longterms list from organisms list
var listFromOrganisms = function(organisms, age) {
	var longterms = [];
	organisms.map(function(org) {
		org.long_terms.map(function(lt) {
			//Verify longterm expiration date is not past
			if (((lt.expiration_date) > (new Date()) || (lt.expiration_date == null)) && (lt.tags != 'archived')) {
				longterms.push({
					'_id': org._id,
					'org_name': org.org_name,
					'cause': org.cause,
					'school_id': org.school_id,
					'long_term': lt
				});
			} else {
			}
		});
	});
	longterms = longterms.filter(function(lt) {
		if (age && lt.long_term.min_age) {
			console.log('Remove' + lt.long_term.intitule + ' because min_age ' + lt.long_term.min_age + ' and age is ' + age + ' ? -> Résultats : ' + !(lt.long_term.min_age <= age));
			return lt.long_term.min_age <= age;
		} else {
			return true;
		}
	})
	return longterms;
}

module.exports = {
	listFromOrganisms
};