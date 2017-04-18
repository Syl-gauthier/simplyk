var assert = require('assert');
var emailer = require('./emailer.js');


var content = {
  customMessage: 'This is an automated test message',
  link: 'www.foo.foo',
  recipient: 'syl.g.test@gmail.com'
};

describe('email/emailer.js (only one)', function() {
  describe('sendSubscriptionOrgEmail',function() {
      it('should send a message with no error', function(done) {
        this.timeout(8000);
        emailer.sendSubscriptionOrgEmail(content, function(err) {
          if(err) done (err);
          else done();
        });
      });
  }); 
});

describe.skip('email/emailer.js (ALL)', function() {
  
  describe('sendSubscriptionOrgEmail',function() {
    it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendSubscriptionOrgEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendSubscriptionVolEmail',function() {
    it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendSubscriptionVolEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendUnsubscriptionEmail',function() {
    it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendUnsubscriptionEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendVerifyEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendVerifyEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendHoursPendingVolEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendHoursPendingVolEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendHoursPendingOrgEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendHoursPendingOrgEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendHoursConfirmedVolEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendHoursConfirmedVolEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendAutomaticSubscriptionOrgEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendAutomaticSubscriptionOrgEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendTransAddEvent',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendTransAddEvent(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendTransAddLongTerm',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendTransAddLongTerm(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendForgottenPasswordEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendForgottenPasswordEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendManualHoursEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendManualHoursEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendOneDayReminderEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendOneDayReminderEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendOneWeekReminderEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendOneWeekReminderEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendTomorrowReminderEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendTomorrowReminderEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendHoursPendingReminderOrgEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendHoursPendingReminderOrgEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendExtraHoursPendingReminderOrgEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendExtraHoursPendingReminderOrgEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });


  describe('sendFiveDaysLongTermExpirationEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendFiveDaysLongTermExpirationEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendLongTermExpirationEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendLongTermExpirationEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendInboundSMSEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendInboundSMSEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendStudentQuestionsEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendStudentQuestionsEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendAdminValidateEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendAdminValidateEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendAdminCorrectEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendAdminCorrectEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });

  describe('sendAdminRefuseEmail',function() {
        it('should send a message with no error', function(done) {
      this.timeout(8000);
      emailer.sendAdminRefuseEmail(content, function(err) {
        console.log('callback called');
        if(err) done (err);
        else done();
      });
    });
  });
});
