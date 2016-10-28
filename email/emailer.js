/*
 *Wrap nodemailer to provide convinient functions to send emails
 * */
var nodemailer = require('nodemailer');
var EmailTemplate = require('email-templates').EmailTemplate;

var emailCredentials = process.env.EMAIL_CREDENTIALS;
if (emailCredentials === 'undefined') {
  throw Error('Email credentials are not present');
}

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(emailCredentials);

// import templates
const verify_template = new EmailTemplate('email/templates/basic_template');

//Wrap sendMail
function callSendMail(mailOptions) {
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      return console.log(error);
    }

    console.log('Message sent: ' + info.response);
  });
}


//Send email with verify url
function sendVerifyEmail(content) {
  content.subtitle = 'On est ravi que tu sois maintenant sur la plateforme Simplyk. Tout d\'abord, confirme ton compte grâce au bouton ci-dessous';
  content.type = 'verify';
  content.button.text = 'Vérifier mon compte';
  content.title = 'Bienvenue ' + content.firstname + ' !';
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"Alex @ Simplyk" <contact@simplyk.org>', // sender address
      to: content.recipient,
      subject: content.firstname + ', vérifie ton courriel', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);

  });
};

function sendSubscriptionOrgEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'subscriptionorg';
  content.title = 'Nouveau bénévole !';
  content.button = {
    text: 'Voir mon bénévole',
    link: content.link
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.log(err);
    }
    var mailOptions = {
      from: '"Alex @ Simplyk" <contact@simplyk.org>', // sener address
      to: content.recipient,
      subject: content.event + ': un nouveau bénévole inscrit !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);

  });
};

function sendSubscriptionVolEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'subscriptionvol';
  content.title = 'Merci ' + content.firstname + ' !';
  content.button = {
    text: 'Voir mon profil',
    link: 'platform.simplyk.org'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"Alex @ Simplyk" <contact@simplyk.org>', // sender address
      to: content.recipient,
      subject: 'Nouvelle inscription sur Simplyk !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendUnsubscriptionEmail(content) {
  content.subtitle = ['Malheureusement,', content.customMessage];
  content.type = 'unsubscriptionorg';
  content.title = 'Désinscription d\'un bénévole :( ';
  content.button = {
    text: 'Voir mon tableau de bord',
    link: 'platform.simplyk.org'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"Alex @ Simplyk" <contact@simplyk.org>', // sender address
      to: content.recipient,
      subject: content.activity_name + ': désinscription d\'un bénévole :( ', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendHoursPendingOrgEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'hourspendingorg';
  content.title = 'Valider la participation';
  content.button = {
    text: 'Valider la participation',
    link: 'platform.simplyk.org/organism/dashboard'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"Alex @ Simplyk" <contact@simplyk.org>', // sender address
      to: content.recipient,
      subject: content.firstname + ' ' + content.lastname + ': validation de la participation !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};

function sendHoursConfirmedVolEmail(content) {
  content.subtitle = ['Félicitation ' + content.firstname + ',', content.customMessage];
  content.type = 'hoursconfirmedvol';
  content.title = 'Participation confirmée !';
  content.button = {
    text: 'Voir mon nouveau profil',
    link: 'platform.simplyk.org/volunteer/profile'
  };
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"Alex @ Simplyk" <contact@simplyk.org>', // sender address
      to: content.recipient,
      subject: content.activity_name + ': participation validée !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};


function sendAutomaticSubscriptionOrgEmail(content) {
  content.subtitle = content.customMessage;
  content.title = 'Bénévolat de ' + content.firstname + ' ' + content.lastname + ' !';
  content.type = 'verify';
  content.button.text = 'Valider les heures de l\'élève';
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var mailOptions = {
      from: '"Alex @ Simplyk" <contact@simplyk.org>', // sender address
      to: content.recipient,
      subject: 'Bénévolat de ' + content.firstname + ' ' + content.lastname + ' !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
};


module.exports = {
  sendSubscriptionOrgEmail: sendSubscriptionOrgEmail,
  sendSubscriptionVolEmail: sendSubscriptionVolEmail,
  sendUnsubscriptionEmail: sendUnsubscriptionEmail,
  sendVerifyEmail: sendVerifyEmail,
  sendHoursPendingOrgEmail: sendHoursPendingOrgEmail,
  sendHoursConfirmedVolEmail: sendHoursConfirmedVolEmail
};