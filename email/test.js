var emailer = require('./emailer.js');

//test send email to
function testVerifyEmail() {
  var recipient = 'arowana87@gmail.com';
  var hostname = 'localhost:4000';

  emailer.sendVerifyEmail({
    recipient: recipient,
    verify_url: hostname + '/thisisateststring'
  });
}

