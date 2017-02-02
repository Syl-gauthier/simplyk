var emailer = require('../../email/emailer.js');
var moment = require('moment');

module.exports = function(agenda) {

  //Job definition
  console.log('We define sendDayBeforeEmail !');
  agenda.define('sendDayBeforeEmail', function(job) {
    console.log('We send sendDayAfterEmail !');
    emailer.sendOneDayReminderEmail({
      recipient: job.attrs.data.email,
      customMessage: [job.attrs.data.firstname + ', tu es en forme pour demain ?', 'N\'oublie pas que ' + job.attrs.data.org_name + ' t\'attend demain, ' + job.attrs.data.start_date + ', à ' + job.attrs.data.address],
      firstname: job.attrs.data.firstname,
      lastname: job.attrs.data.lastname
    });
  });

  console.log('We define sendDayAfterEmail !');
  agenda.define('sendDayAfterEmail', function(job) {
    console.log('We send sendDayAfterEmail !');
    emailer.sendTomorrowReminderEmail({
      recipient: job.attrs.data.email,
      customMessage: [job.attrs.data.firstname + ', ton bénévolat d\'hier s\'est bien passé ?', 'Pour faire évoluer ton profil, valide tes heures sur la plateforme ! ', 'En plus, cela permet aussi à ' + job.attrs.data.org_name + ' de tenir les comptes de son impact !'],
      firstname: job.attrs.data.firstname,
      lastname: job.attrs.data.lastname
    });
  });

  console.log('We define sendOneWeekBeforeEmail !');
  agenda.define('sendOneWeekBeforeEmail', function(job) {
    console.log('We send sendOneWeekBeforeEmail !');
    emailer.sendOneWeekReminderEmail({
      recipient: job.attrs.data.email,
      customMessage: [job.attrs.data.firstname + ', on compte sur toi !', 'Pour rappel, ' + job.attrs.data.org_name + ' t\'attends bientôt, ' + job.attrs.data.start_date + ', à ' + job.attrs.data.address, 'À très vite ! ;)'],
      firstname: job.attrs.data.firstname,
      lastname: job.attrs.data.lastname,
      event: job.attrs.data.event_intitule
    });
  });
};
