'use strict';
const Admin = require('../../models/admin_model.js');

const getClientSchools = function(callback) {
	Admin.find({
		type: 'school-coordinator'
	}, function(err, admins) {
		if (err) {
			console.error(err);
			return callback(err, null);
		}
		const clients = admins.map(a => ({
			name: a.name,
			id: a._id,
			classes: a.classes
		}));
		console.log('Client schools : ' + JSON.stringify(clients));
		return callback(null, clients);
	})
}

getClientSchools(function(a, b){});

module.exports = {
	getClientSchools
}