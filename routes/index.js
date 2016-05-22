var express = require('express');
var router = express.Router();
var stormpath = require('express-stormpath');
var mongoose = require('mongoose');
var GoogleMapsAPI = require('googlemaps');
var stormpathGroupsRequired = require('../middlewares/stormpathGroupsRequired').stormpathGroupsRequired;

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var app = express();

var Opp = require('../models/opp_model.js');
var User = require('../models/user_model.js');

//Google Maps initialization
var publicConfig = {
	key: 'AIzaSyANe9e2wczal0DBI-UvUtVM2WAEn-cHzwo',
	stagger_time:1000, // for elevationPath
	encode_polylines:false/*,
	secure:true, // use https
	proxy:'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests */
};
var gmAPI = new GoogleMapsAPI(publicConfig);

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('accueil.jade');
});

/* GET home page. */
router.get('/user', stormpath.getUser, function(req, res, next) {
	res.json(req.user);
});

router.get('/customData', stormpath.getUser, stormpath.loginRequired, function(req, res, next) {
	var customData = req.user.customData;
	res.json(customData);
});

/*GET dashboard page*/
router.get('/dashboard', stormpath.getUser, stormpath.loginRequired, function(req, res){
	Opp.find({oName: req.user.customData.oname}, function(err, opps){
		if(err){
			console.log(err);
			res.render('dashboard.jade', {session: req.session});
		}
		//Create opps list
		else{
      console.log(opps.toString());
			res.render('dashboard.jade', {opps: opps, session: req.session});
		}
	});
});

router.get('/profile', stormpath.getUser, stormpath.loginRequired, function(req,res){
	console.log(req.user.customData);
	res.render('profile.jade', {session: req.session, favs: req.user.customData.favopps});
});

router.get('/addopp', /*stormpath.groupsRequired(['organism'], false),*/ function(req, res){
	res.render('addopp.jade');
});

router.post('/addopp', stormpath.getUser, function(req,res){
	//Transform address into lon/lat
	console.log('address sent to gmaps: ' + req.body.address)
	codeAddress(req.body.address, function(lat, lon){
		console.log(lat + lon);

		var opp = new Opp({
			intitule: req.body.intitule,
			oName: req.user.customData.oname,
			nbBenevoles: req.body.nbBenevoles,
			date: req.body.date,
      venue: req.body.address,
			lat: lat,
			lon: lon,
			mail: req.user.email
		});

		opp.save(function(err){
			if(err){
				var error = 'Something bad happened! Try again!';
				res.render('addopp.jade', {error: err})
			}
			else{
				res.redirect('/dashboard');
			}
		});

	});
});

//for ajax call only (for now)
//Get users info from an opp intitule
router.post('/getOppUsers', function(req, res){
  console.log("opp_id: " + req.body.opp_id);

  Opp.findById(req.body.opp_id, function(err, opp){
		if(err){
			console.log(err);
      res.write(err);
      res.end();
		}
		else{
      console.log(opp.toString());

      //Extract ids
      var extract_ids = function(users_array){
        user_ids = [];
        users = users_array;
        for(var i = 0; i < users_array.length; i++)
        {
          user_ids.push(users_array[i].id);
        }
        console.log("user_ids: "+user_ids.toString());
        return user_ids;
      };

      User.find({_id: {$in: extract_ids(opp.users)}}, function(err, users_in_opp){
        if(err) console.log(error);

        console.log(users_in_opp.toString());
        if(users_in_opp){
          res.write(users_in_opp.toString());
        }
        else{
          res.write("empty");
        }
        res.end();
      });
		}
	});
});

function codeAddress(address, done) {
	gmAPI.geocode( {'address': address}, function(err, result) {
		if (err) {
			console.log('geocode error: ');
			console.log(err);
		} else {
			console.log(result.results[0].geometry.location);
			var lat = result.results[0].geometry.location.lat;
			var lon = result.results[0].geometry.location.lng;
			console.log('latitude result: ' + lat)
			return done(lat, lon);
		}
	});
}

module.exports = router;
