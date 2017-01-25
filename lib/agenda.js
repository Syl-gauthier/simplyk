'use strict';
const Agenda = require('agenda');

//DOCUMENTATION : https://github.com/rschmukler/agenda
let agenda = new Agenda();

agenda.database(process.env.MONGO_DB_CREDENTIALS, 'agendaJobs');

//Files with jobs in it
const jobsToDo = ['test'];

jobsToDo.map(function(jobs){
	require('./agenda/'+jobs+'.js')(agenda);
});

if (jobsToDo.length) {
	agenda.start();
}

module.exports = agenda;