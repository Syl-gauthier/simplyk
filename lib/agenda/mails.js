var emailer = require('../../email/emailer.js');
var moment = require('moment');
var OrgTodo = require('../../models/o_todo_model.js');
var Organism = require('../../models/organism_model.js');

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

  console.log('We define sendHoursPendingOrgReminderEmail !');
  agenda.define('sendHoursPendingOrgReminderEmail', function(job) {
    console.log('We send sendHoursPendingOrgReminderEmail !');

    OrgTodo.findOne({
      '_id': job.attrs.data.todo_id
    }, function(err, org_to_do) {
      if (err) {
        console.log('ERR : ' + err);
      }
      if (org_to_do) {
        Organism.findById(org_to_do.org_id, {
          email: true
        }, function(err, orga) {
          if (err) {
            console.log('ERR: dont find organism with org_to_do in sendHoursPendingOrgReminderEmail !');
            console.log(err);
          } else {
            console.log('orga.email: ' + orga.email);
            if (org_to_do.type == 'hours_pending') {
              emailer.sendHoursPendingReminderOrgEmail({
                recipient: 'thibaut.jaurou@gmail.com',
                name: job.attrs.data.vol_name,
                event_intitule: org_to_do.activity_intitule,
                customMessage: [job.attrs.data.vol_name + ' a fait du bénévolat chez vous pour ' + org_to_do.activity_intitule + ' et sa participation n\'est pas encore validée !', 'C\'est très important de lui valider ses heures, cela permet de le remercier pour le temps qu\'il a donné ! ', 'En plus, cela prend seulement quelques secondes.', 'Merci beaucoup ! ;)']
              });
            } else if (org_to_do.type == 'students_hours_pending') {
              emailer.sendExtraHoursPendingReminderOrgEmail({
                recipient: 'thibaut.jaurou@gmail.com',
                name: job.attrs.data.vol_name,
                event_intitule: org_to_do.activity_intitule,
                customMessage: [job.attrs.data.vol_name + ' a fait du bénévolat chez vous pour ' + org_to_do.activity_intitule + ' et sa participation n\'est pas encore validée !', 'C\'est très important de lui valider ses heures puisqu\'il en a besoin pour sa scolarité et cela permet de le remercier pour le temps qu\'il a donné ! ', 'En plus, cela prend seulement quelques secondes.', 'Merci beaucoup ! ;)']
              });              
            }
          }
        });
      } else { //TO DO ALREADY DONE
      };
    })
  });
};