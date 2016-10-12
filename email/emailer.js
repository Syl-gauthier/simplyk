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
const verify_template = new EmailTemplate('./templates/verify_template');

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

// content newUser
function sendWelcomeEmail(content) {
  var body = '<p>You created an account for ' + content.firstname + '. <br>' + content.customMessage + ' <a href="simplyk.org">Simplyk</a></p>';

  var mailOptions = {
    from: '"Alex @ Simplyk" <contact@simplyk.org>', // sender address
    to: content.recipient,
    subject: 'Bienvenue sur Simplyk', // Subject line
    text: '', // plaintext body
    html: body
  };

  callSendMail(mailOptions);
  console.log('callSendMail call');
};

//Send email with verify url
function sendVerifyEmail(content) {
  content.subtitle = 'On est ravi que tu nous rejoignes. Tout d\'abord, confirme ton compte grâce au bouton ci-dessous';
  content.type = 'verify';
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
  var headerstream = fs.createReadStream('./email/template_header.html');
  var mailOptions = {
    from: '"Alex @ Simplyk" <contact@simplyk.org>', // sender address
    to: content.recipient,
    subject: 'Nouvelle inscription sur Simplyk !', // Subject line
    text: '', // plaintext body
    html: headerstream
  };

  callSendMail(mailOptions);
}

function sendSubscriptionVolEmail(content) {
  content.subtitle = content.customMessage;
  content.type = 'subscriptionvol';
  verify_template.render(content, function(err, results) {
    if (err) {
      return console.error(err);
    };

    var body = 'Merci ' + content.name + ' !' + '<br> ' + content.customMessage + '<br> <a href="platform.simplyk.org/volunteer/profile">Voir mon profil</a></p>';

    var mailOptions = {
      from: '"Alex @ Simplyk" <contact@simplyk.org>', // sender address
      to: content.recipient,
      subject: 'Nouvelle inscription sur Simplyk !', // Subject line
      text: '', // plaintext body
      html: results.html
    };

    callSendMail(mailOptions);
  });
}

function sendUnsubscriptionEmail(content) {
  var body = '<p>Malheureusement, ' + '<br> ' + content.customMessage + '<br> <a href="platform.simplyk.org">Voir mes bénévoles</a></p>';

  var mailOptions = {
    from: '"Alex @ Simplyk" <contact@simplyk.org>', // sender address
    to: content.recipient,
    subject: 'Désinscription sur Simplyk :(', // Subject line
    text: '', // plaintext body
    html: body
  };

  callSendMail(mailOptions);
}

module.exports = {
  sendWelcomeEmail: sendWelcomeEmail,
  sendSubscriptionOrgEmail: sendSubscriptionOrgEmail,
  sendSubscriptionVolEmail: sendSubscriptionVolEmail,
  sendUnsubscriptionEmail: sendUnsubscriptionEmail,
  sendVerifyEmail: sendVerifyEmail
};