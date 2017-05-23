var expect = require("expect.js");
var longtermsListCreation = require("../longterms.js").listFromOrganisms;

describe("longterms", function() {
	describe("listFromOrganisms", function() {
		it("should return the expected listFromOrganisms", function() {
			var organisms = [{
				"_id": 12,
				"org_name": "Simplyk Dev",
				"long_terms": [{
					"slot": "100100100100100000000",
					"min_hours": 4,
					"address": "123 Rue de la Gauchetière Ouest, Montréal, QC, Canada",
					"description": "Littérature québecoise",
					"intitule": "Mentor de littérature",
				}, {
					"slot": "100100100100100000000",
					"min_hours": 4,
					"address": "123 Rue de la Gauchetière Ouest, Montréal, QC, Canada",
					"description": "Littérature française",
					"intitule": "Mentor de littérature",
				}]
			}, {
				"_id": 19,
				"org_name": "Simplyk Biz",
				"long_terms": [{
					"slot": "100100100100100000000",
					"min_hours": 4,
					"address": "123 Rue de la Gauchetière Ouest, Montréal, QC, Canada",
					"description": "Littérature anglaise",
					"intitule": "Mentor de littérature",
				}, {
					"slot": "100100100100100000000",
					"min_hours": 4,
					"address": "123 Rue de la Gauchetière Ouest, Montréal, QC, Canada",
					"description": "Littérature japonaise",
					"intitule": "Mentor de littérature",
				}]
			}];
			var longtermsList = longtermsListCreation(organisms);
			expect(longtermsList).to.have.length(4);
		});
	});
});