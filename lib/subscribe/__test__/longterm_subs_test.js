var expect = require("expect.js");
var subscriber = require("../longterm_subs.js");

describe('longterm_subscription', function() {
	describe('subscribe', function(done) {
		var lt_id = "57e400186df04b4f7f2152b9";
		var organism = {
			"_id": {
				"$oid": "57e20267956b081100f7dff6"
			},
			"org_name": "Simplyk Dev",
			"lastname": "Jaurou",
			"long_terms": [{
				"intitule": "Mentor de littérature",
				"_id": {
					"$oid": "57e400186df04b4f7f2152b9"
				},
				"applicants": []
			}],
			"events": []
		};
		var volunteer = {
			"_id": {
				"$oid": "57ce5c5740e906ec100cf638d"
			},
			"lastname": "JAUROU",
			"long_terms": [],
			"events": []
		};
		subscriber.subscribe(volunteer, lt_id, done);
		it('should add longterm to volunteer', function() {
			expect(volunteer.long_terms[0]).to.have.property("org_id", organism._id);
		});
		it('should volunteer to longterm applicant', function() {
			expect(organism.long_terms[0]).to.have.property("applicants", [volunteer._id]);
		});
	});
});