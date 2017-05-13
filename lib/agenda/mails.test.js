'use strict';
var assert = require('assert');
const Agenda = require('agenda');

var agenda = new Agenda({
  'db': {
    'address': process.env.MONGO_DB_CREDENTIALS
  }
});

describe('mails.js', function () {
  before(function (done) {
    this.timeout(15000);
    agenda.on('ready', function () {
      require('./mails.js')(agenda);
      agenda.start();
      done();
    });
  });

  describe('defune.(\'sendDayBeforeEmail\')', function () {
    it('should set a sendDayBeforeEmail test in agenda._definitions', function () {
      assert.ok(agenda._definitions['sendDayBeforeEmail']);
    });
  });
});
