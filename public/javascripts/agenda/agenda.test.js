var assert = require('assert');

describe.skip('agenda.js', function() {
  //var agenda = require('./agenda.js');
  it('should process every 120000ms', function() {
    assert.equal(120000, agenda._processEvery);
  });
  
  it.skip('should be connected to the proper database once ready', function(done) {
    agenda.on('ready', function() {
      assert.equal('heroku_l6prczn1', agenda._mdb.databaseName);
      done();
    });
  });
});