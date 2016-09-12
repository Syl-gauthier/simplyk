/*
 *Wrap nodemailer to provide convinient functions to send emails
 * */
var nodemailer = require('nodemailer');

var emailCredentials = process.env.EMAIL_CREDENTIALS;
if(emailCredentials === 'undefined') {
  throw Error('Email credentials are not present');
}

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(emailCredentials);

//Wrap sendMail
function callSendMail(mailOptions) {
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }

    console.log('Message sent: ' + info.response);
  });
}

// content newUser
function sendWelcomeEmail(content) {
  var body = '<p>You created an account for ' + content.name 
    + '. ' + content.customMessage
    + ' <a href="simplyk.org">Simplyk</a></p>';

  var mailOptions = {
    from: '"Simplyk', // sender address
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
  var body = '<div><p>Vérifie ton adresse courriel : ' + content.recipient + '</p></div>'
    + '<div><a href="'+ content.verify_url + '">Clique ici</a></div>';

  console.log(body);

  var mailOptions = {
    from: '"Alex @ Simplyk" <contact@simplyk.org>', // sender address
    to: content.recipient, 
    subject: content.firstname + ', vérifie ton courriel', // Subject line
    text: '', // plaintext body
    html: body
  };

  callSendMail(mailOptions);
};

function sendSubscriptionEmail(content) {
  var body = '<p>Good news ' + content.name + ' !'
    + '. ' + content.customMessage
    + ' <a href="simplyk.org">Simplyk</a></p>';

  var mailOptions = {
    from: '"Simplyk', // sender address
    to: content.recipient, 
    subject: 'Welcome to Simplyk', // Subject line
    text: '', // plaintext body
    html: body
  };

  callSendMail(mailOptions);
}

module.exports = {
  sendWelcomeEmail: sendWelcomeEmail,
  sendSubscriptionEmail: sendSubscriptionEmail,
  sendVerifyEmail: sendVerifyEmail
};
