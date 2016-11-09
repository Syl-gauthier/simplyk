var express = require('express');

//Create longterms list from organisms list
var listFromOrganisms = function(organisms, age) {
	var longterms = [];
	organisms.map(function(org) {
		org.long_terms.map(function(lt) {
			longterms.push({
				'_id': org._id,
				'org_name': org.org_name,
				'cause': org.cause,
				'long_term': lt
			});
		});
	});
	longterms.filter(function(lt){
		if(age){
			return lt.min_age <= age;
		} else {
			return true;
		}
	})
	return longterms;
}

module.exports = {
	listFromOrganisms: listFromOrganisms
};