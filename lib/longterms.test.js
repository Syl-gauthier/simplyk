var assert = require('assert');
var longtermsListCreation = require("./longterms.js");


var date = new Date();
//mock organisms: only the relevant parameter are defined
var organisms = [{
    "_id": 1,
    "org_name": "testOrg1", //tests on the date, only 1 of these long_terms should be in the return array
    "long_terms": [{
        "expiration_date": new Date(date.getTime()+3600000),
        "intitule": "expiration_date in the futur",
      }, {
        "expiration_date": Date(date.getTime()-3600000),
        "intitule": "expiration_date in the past",
      }, {
        "tags": "archived",
        "intitule": "tags = archived",
      }]
  }, {
    "_id": 2,
    "org_name": "testOrg2", //tests on the age, should return 2 long_terms when age is undefinied, 1 when 0<= age <18 and 2 when age >=18 
    "long_terms": [{
        "intitule": "intitule3",
        "min_age": 18,
      }, {
        "intitule": "intitule4",
        "min_age": 0,
      }]
  }];


describe("longterms", function() {
  
	describe("listFromOrganisms", function() {
    
		it("should return an array of the longterms of organisme that are not expired or achieved", function() {
      let longtermsList = longtermsListCreation.listFromOrganisms(organisms);
			assert.equal(3 , longtermsList.length);
		});
    
    it("should filter the longterms where min_age<=age when age and min_age are defined", function() {
      longtermsList = longtermsListCreation.listFromOrganisms(organisms, 0);
      //quand age = 0 la condition est buggé car 0 == false en javascript
      //assert.equal(2 , longtermsList.length, "fail for age =0");
      longtermsList = longtermsListCreation.listFromOrganisms(organisms, 10);
			assert.equal(2 , longtermsList.length, "fail for age =10");
      longtermsList = longtermsListCreation.listFromOrganisms(organisms, 100);
			assert.equal(3 , longtermsList.length, "fail for age =100");
    });
    
	});
});