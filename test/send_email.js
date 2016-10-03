var emailer = require('../email/emailer.js')

var content = {
	recipient: 'thibaut.jaurou@gmail.com',
	name: 'Simplyk Dev',
	customMessage: 'Thibaut Jaurou s\'est inscrit à votre activité Préparation des bouchées de l\'évènement X conférence !<br>'
};

var subcontent = {
	recipient: 'thibaut.jaurou@gmail.com',
	name: 'Thibaut Jaurou',
	customMessage: 'Thibaut Jaurou s\'est inscrit à votre activité Préparation des bouchées de l\'évènement X conférence !<br>'
};

var unsubcontent = {
	recipient: 'thibaut.jaurou@gmail.com',
	name: 'Simplyk Dev',
	customMessage: 'Thibaut Jaurou s\'est désinscrit de votre activité Préparation des bouchées de l\'évènement X conférence !'
};

var volcontent = {
	recipient: 'thibaut.jaurou@gmail.com',
	name: 'Thibaut Jaurou',
	customMessage: 'Tu t\' es inscrit à l\'engagement de SimplykDev : Test de la plateforme !<br>' + ' N\'oublie pas d\'enregistrer tes heures de participation à cet engagement ! <br> Cela bénéficiera à la fois à SimplykDev et à toi pour passer aux échelons supérieurs de l\'engagement ! <br> :)'
};

emailer.sendWelcomeEmail(content);
emailer.sendSubscriptionOrgEmail(subcontent);
emailer.sendSubscriptionVolEmail(volcontent);
emailer.sendUnsubscriptionEmail(unsubcontent);
console.log(content);