var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Volunteer = require('../../models/volunteer_model.js');

var Nexmo = require('nexmo');
var PhoneNumber = require('libphonenumber-js');

var nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET
}, {
  debug: true
});

function sendNexmoSMS(content) {
  const number = PhoneNumber.format(PhoneNumber.parse(content.phone, 'CA'), 'International_plaintext');
  if (number) {
    nexmo.message.sendSms('12262424040', number, content.message, {
      'status-report-req': 1
    }, function(err) {
      console.info('In nexmo callback with err : ' + JSON.stringify(err));
      console.info('SMS :' + content.message + ' sent to ' + number);
    });
  } else {
    console.info('SMS not sent since number is undefined : ' + number);
  }
}


function sendSMSEntireSchool(school_id) {
  // Send SMS to an entire school to say how many hours they have done
  var hours_count = function(previousValue, currentValue, currentIndex, array) {
    if (currentValue) {
      return previousValue + currentValue;
    } else {
      return currentValue;
    }
  };

  var getConfirmed = function(vol) {
    return (vol.events.filter(function(ev) {
      if (ev.hours_done > 0) {
        return true;
      } else {
        return false;
      }
    }).map(el => el.hours_done).reduce(hours_count, 0) + vol.long_terms.filter(function(lt) {
      if (lt.hours_done > 0) {
        return true;
      } else {
        return false;
      }
    }).map(el => el.hours_done).reduce(hours_count, 0) + vol.extras.filter(function(lt) {
      if (lt.hours_done > 0) {
        return true;
      } else {
        return false;
      }
    }).map(el => el.hours_done).reduce(hours_count, 0) + vol.manuals.filter(function(lt) {
      if (lt.hours_done > 0) {
        return true;
      } else {
        return false;
      }
    }).map(el => el.hours_done).reduce(hours_count, 0)) + 'h'
  }

  Volunteer.find({
    "admin.school_id": school_id
  }, function(err, volunteers) {
    if (err) {
      console.error('ERR : ' + err);
    } else {
      var success = 0;
      volunteers.map(function(vol, index) {
        const number = PhoneNumber.format(PhoneNumber.parse(vol.phone, 'CA'), 'International_plaintext');
        if (number) {
          success++;
          console.info('phone : ' + number + '  ' + success + '/' + index);
          console.info('firstname : ' + vol.firstname + '  ' + getConfirmed(vol));
          var message = 'Salut ' + vol.firstname + ', c\'est Simplyk. Juste pour te prévenir que tu en es à ' + getConfirmed(vol) + ' de bénévolat pour ' + vol.admin.school_name + ' cette année. :) Pour compléter tes heures, connecte toi sur la plateforme avec ton courriel : ' + vol.email;
          console.info('message : ' + message);
          nexmo.message.sendSms('12262424040', number, message, {
            'status-report-req': 1
          }, function(err) {
            console.info('In nexmo callback with err : ' + JSON.stringify(err));
          });
        }
      });
    }
  });
}


module.exports = ({
  sendSMSEntireSchool,
  sendNexmoSMS
});