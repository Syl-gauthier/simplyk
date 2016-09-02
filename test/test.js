var Mocha = require('mocha');
var expect = require('chai').expect;
var gmaps = require('../middlewares/gmaps.js');

var mocha = new Mocha({
    ui: "tdd",
    reporter: "spec"
});

describe('Array', function(){
	describe('#indexOf()', function(){
		it('should return -1 when the value is not present', function(){
			expect([1,2,3].indexOf(4)).to.equal(-1);
		})
	});
});

describe('GMaps', function(){
	describe('#codeAddress()', function(){
		it('should return ZERO_RESULT if address wrong', function(){
			const address = 'bloblo';
			gmaps.codeAddress(address, function(lat, lon){
				expect(lat).equal('ZERO_RESULTS');
			});
		})
	})
})