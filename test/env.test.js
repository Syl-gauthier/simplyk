var assert = require('assert');

describe.skip('Environnement variable', function() {

  describe('intercomEnv', function() {
    it('should have an INTERCOM_TOKEN environnement variable', function() {
      assert.notEqual(undefined, process.env.INTERCOM_TOKEN);
    });
    it('should have an  INTERCOM_SECRET_KEY environnement variable', function() {
      assert.notEqual(undefined, process.env.INTERCOM_SECRET_KEY);
    });
  });
  
  describe('mongoDBEnv', function() {
    it('should have a MONGO_DB_CREDENTIALS environnement variable', function() {
      assert.notEqual(undefined, process.env.MONGO_DB_CREDENTIALS);
    });
  });
  
  describe('nexmoEnv', function() {
    it('should have a NEXMO_API_KEY environnement variable', function() {
      assert.notEqual(undefined, process.env.NEXMO_API_KEY);
    });
    it('should have a NEXMO_API_SECRET environnement variable', function() {
      assert.notEqual(undefined, process.env.NEXMO_API_SECRET);
    });
  });
  
  
  describe('emailerEnv', function() {
    it('should have an EMAIL_CREDENTIALS environnement variable', function() {
      assert.notEqual(undefined, process.env.EMAIL_CREDENTIALS);
    });
  });
  
});
