var assert = require('assert');
var sloter = require('./slot.js');

var body = { //the equivalent slotString is '100100100100100000000'
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

var slotString = '100000000000001000000'; //the mondayAM and fridayEVE are on

describe('lib/slot.js', function() {
  describe('createSlotString', function() {
    var slotString = sloter.createSlotString(body);
    it('should return a 21 bits long binary number as a string', function() {
      assert.equal('string',typeof slotString, 'slotString is not a string');
      assert.equal(21, slotString.length, 'slotString is not 21 bits long');
    });
    it('should have each bits matching the value of the <day>[AM,PM,EVE] parameter of body', function () {
      assert.equal('100100100100100000000', slotString);
    });
  });

  describe  ('rewindSlotString', function() {
    var slotJSON = sloter.rewindSlotString(slotString);

    it('should return an object', function() {
      assert.equal('object', typeof slotJSON);
    })
    it('the object should have a property matching each \'1\' from slotString', function() {
      assert.equal(true, slotJSON.mondayAM);
      assert.equal(true, slotJSON.fridayEVE);
    });
  });

});
