var emailer = require('../email/emailer.js')

var content = {
  recipient: 'arowana87@gmail.com',
  name: 'Pierre',
  customMessage: 'Congratulation, create an event to get volunteers!'
};

emailer.sendWelcomeEmail(content);
