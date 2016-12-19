var GoogleMapsAPI = require('googlemaps');
var express = require('express');
var router = express.Router();
//Google Maps initialization
var publicConfig = {
	key: 'AIzaSyANe9e2wczal0DBI-UvUtVM2WAEn-cHzwo',
	stagger_time:1000, // for elevationPath 
	encode_polylines:false/*,
	secure:true, // use https 
	proxy:'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests */
};
var gmAPI = new GoogleMapsAPI(publicConfig);

var codeAddress = function(address, done) {
	console.log('adress : ' + address);
	gmAPI.geocode( {'address': address}, function(err, result) {
		if (err) {
			console.log('geocode error: ');
			console.log(err);
		} else {
			console.log('result : ' + JSON.stringify(result));
			console.log('result.results[0] : ' + result.results[0]);
			if(result.status == 'ZERO_RESULTS'){
				return done('ZERO_RESULTS', 'ZERO_RESULTS', 'ZERO_RESULTS');
			}
			else{
				console.log(result.results[0].geometry.location);
				var lat = result.results[0].geometry.location.lat;
				var lon = result.results[0].geometry.location.lng;
				var string = result.results[0].formatted_address;
				console.log('latitude result: ' + lat);
				return done(lat, lon, string);
			}
		}
	});
};

module.exports = {codeAddress: codeAddress};