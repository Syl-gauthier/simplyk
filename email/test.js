var emailer = require('./emailer.js');

//test send email to
/*function testVerifyEmail() {
  console.log('Send test verify email');

  var recipient = 'arowana87@gmail.com';
  var hostname = 'localhost:4000';

  emailer.sendVerifyEmail({
    recipient: recipient,
    verify_url: 'http://' + hostname + '/thisisateststring'
  });
}

testVerifyEmail();*/
function testVerifyEmail() {
	console.log('Send test verify email');

	var recipient = 'thibaut.jaurou@gmail.com';
	var firstname = 'Thibaut';

	emailer.sendVerifyEmail({
		recipient: recipient,
		firstname: firstname,
		gif: 'http://i.giphy.com/k6V7dbAsBZg5y.gif',
		button: {
			text: 'Vérifier mon compte',
			link: 'simplyk.io'
		}
	});
}

testVerifyEmail();


function testSubscriptionVolEmail() {
	console.log('Send Subscription Vol Email');

	var recipient = 'thibaut.jaurou@gmail.com';
	var firstname = 'Thibaut';

	emailer.sendSubscriptionVolEmail({
		recipient: recipient,
		firstname: firstname,
		customMessage: ['Tu t\' es inscrit à l\'évènement de Simplyk Dev : Test de la plateforme !', ' N\'oublie pas d\'enregistrer tes heures de participation à cet évènement ! ', 'Cela bénéficiera à la fois à Simplyk Dev et à toi pour passer aux échelons supérieurs de l\'engagement !'],
		title: 'Merci '+firstname+' !'
	});
}

testSubscriptionVolEmail();