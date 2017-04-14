var expect = require('expect.js');
var sloter = require('./slot.js');

describe('slot-creation', function() {
	it('should return the good slotString', function() {
		var body = {
			"title": "Mentor de littérature",
			"description": "Littérature québecoise",
			"address": "169 Rue Beaubien Est, Montréal, QC, Canada",
			"expiration_date": "25 November, 2016",
			"expiration_date_submit": "2016-11-25",
			"min_hours": "5",
			"vol_nb": "1",
			"min_age": "",
			"language": "enfr",
			"mondayAM": "on",
			"tuesdayAM": "on",
			"wednesdayAM": "on",
			"thursdayAM": "on",
			"fridayAM": "on"
		};
		var slotString = sloter.createSlotString(body);
		expect(slotString).to.equal('100100100100100000000');
	});
});

describe('slot-rewind', function() {
	it('should return the good slotString', function() {
		var slotString = '100000000000001000000';
		var slotJSON = sloter.rewindSlotString(slotString);
		expect(slotJSON).to.have.property("mondayAM", true);
		expect(slotJSON).to.have.property("fridayEVE", true);
	});
});