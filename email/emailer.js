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
    from: '"Simplyk admin <test@robotfactory.me>', // sender address
    to: content.recipient, 
    subject: 'Welcome to Simplyk', // Subject line
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
    from: '"Simplyk admin <test@robotfactory.me>', // sender address
    to: content.recipient, 
    subject: 'Welcome to Simplyk', // Subject line
    text: '', // plaintext body
    html: body
  };

  callSendMail(mailOptions);
}

module.exports = {
  sendWelcomeEmail: sendWelcomeEmail,
  sendSubscriptionEmail: sendSubscriptionEmail
};
