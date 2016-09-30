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
	customMessage: 'Thibaut Jaurou s\'est désinscrit à votre activité Préparation des bouchées de l\'évènement X conférence !'
};

emailer.sendWelcomeEmail(content);
emailer.sendSubscriptionEmail(subcontent);
emailer.sendUnsubscriptionEmail(unsubcontent);
console.log(content);

