var emailer = require('../email/emailer.js')

var content = {
  recipient: 'thibaut.jaurou@gmail.com',
  name: 'Thibaut',
  customMessage: 'Congratulation, create an event to get volunteers!'
};

emailer.sendWelcomeEmail(content);
