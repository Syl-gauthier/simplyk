const expect = require("expect.js");
const getSchoolList = require('../schools_list.js').getSchoolList;


describe('schoolslist', function() {
	it("should return an array of Strings only", function(done) {
		getSchoolList('./public/javascripts/schools/__test__/school_sample.csv', function(err, list) {
			if (err) {
				done(err)
			};
			expect(list).to.be.an('array');
			list.forEach(function(school) {
				console.info('list[e] ' + school + ' type is ' + typeof school);
				expect(school).to.be.a('string');
			});
			expect(list).to.have.length(11);
			done();
		});
	})
});