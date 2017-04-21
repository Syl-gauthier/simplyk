var assert = require('assert');
var emailer = require('./emailer.js');




describe('email/emailer.js', function () {
  var content = {
      customMessage: 'This is an automated test message',
      link: 'www.foo.foo',
      recipient: 'syl.g.test@gmail.com'
    };
  
  this.retries(2);
  this.timeout(10000)
  
  describe('sendSubscriptionOrgEmail', function () {
    it('should not fail if \'callback\' is undefined', function (done) {
      emailer.sendSubscriptionOrgEmail(content);
      setTimeout(function(){
        done();
      }, 8000);
    });
    it('should send a message with no error', function (done) {
      emailer.sendSubscriptionOrgEmail(content, function (err) {
        if (err) done(err);
        else done();
      });
    });
  });


  describe.skip('more tests', function () {
    
    describe('sendSubscriptionOrgEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendSubscriptionOrgEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendSubscriptionVolEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendSubscriptionVolEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendUnsubscriptionEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendUnsubscriptionEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendVerifyEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendVerifyEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendHoursPendingVolEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendHoursPendingVolEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendHoursPendingOrgEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendHoursPendingOrgEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendHoursConfirmedVolEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendHoursConfirmedVolEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendAutomaticSubscriptionOrgEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendAutomaticSubscriptionOrgEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendTransAddEvent', function () {
      it('should send a message with no error', function (done) {
        emailer.sendTransAddEvent(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendTransAddLongTerm', function () {
      it('should send a message with no error', function (done) {
        emailer.sendTransAddLongTerm(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendForgottenPasswordEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendForgottenPasswordEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendManualHoursEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendManualHoursEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendOneDayReminderEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendOneDayReminderEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendOneWeekReminderEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendOneWeekReminderEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendTomorrowReminderEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendTomorrowReminderEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendHoursPendingReminderOrgEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendHoursPendingReminderOrgEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendExtraHoursPendingReminderOrgEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendExtraHoursPendingReminderOrgEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });


    describe('sendFiveDaysLongTermExpirationEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendFiveDaysLongTermExpirationEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendLongTermExpirationEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendLongTermExpirationEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendInboundSMSEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendInboundSMSEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendStudentQuestionsEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendStudentQuestionsEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendAdminValidateEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendAdminValidateEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendAdminCorrectEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendAdminCorrectEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });

    describe('sendAdminRefuseEmail', function () {
      it('should send a message with no error', function (done) {
        emailer.sendAdminRefuseEmail(content, function (err) {
          if (err) done(err);
          else done();
        });
      });
    });
  });
});
