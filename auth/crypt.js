var bcrypt = require('bcrypt-nodejs');

generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

validPassword = function(password){
  return bcrypt.compareSync(password, this.password);
};

module.exports = {
  generateHash: generateHash,
  validPassword: validPassword
} 
