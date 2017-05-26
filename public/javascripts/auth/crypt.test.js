//if this is a client side test, it should be run with karma in browser
"use strict";
const assert = require('assert');
const bcrypt = require('bcrypt-nodejs');
const crypt = require('./crypt');


describe('auth/crypt.js', function() {
  const pwd = 'testpassword123ABC';

  describe('generateHash', function() {
    it('should return a hash of password', function() {
      this.password = crypt.generateHash(pwd);
      assert.equal(true, bcrypt.compareSync(pwd, this.password));
    });
  });

  describe('validPassword', function() {
    const entity = {};
    entity.password = bcrypt.hashSync(pwd, bcrypt.genSaltSync(10), null);
    entity.validPassword = crypt.validPassword;

    it('should return true when the password match the object (\'this\') hash', function() {
      assert.equal(true, entity.validPassword(pwd));
    });
  });

});