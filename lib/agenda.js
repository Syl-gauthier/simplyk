'use strict';
const Agenda = require('agenda');

//DOCUMENTATION : https://github.com/rschmukler/agenda
let agenda = new Agenda({
	'db': {
		'address': process.env.MONGO_DB_CREDENTIALS
	}
});

agenda.processEvery('10 seconds');

agenda.on('ready', function() {

	//Files with jobs in it
	const jobsToDo = ['test'];

	jobsToDo.map(function(jobs) {
		require('./agenda/' + jobs + '.js')(agenda);
	});
	agenda.start();
});



module.exports = agenda;