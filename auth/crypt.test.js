var assert = require('assert');
var bcrypt = require('bcrypt-nodejs');
var crypt = require('./crypt');


describe('Array', function() {
  var pwd = 'testpassword123ABC';

  describe('generateHash', function() {
    it('should return a hash of password', function() {
      this.password = crypt.generateHash(pwd);
      assert.equal(true, bcrypt.compareSync(pwd, this.password));
    });
  });
  
  describe('validPassword', function() {
    var entity = {};
    entity.password = bcrypt.hashSync(pwd, bcrypt.genSaltSync(10), null);
    entity.validPassword = crypt.validPassword;
    
    it('should return true when the password match the object (\'this\') hash', function() {
      assert.equal(true, entity.validPassword(pwd));
    });
  });

});