var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stormpath = require('express-stormpath');
var mongoose = require('mongoose');
var session = require('client-sessions');

//Routes files
var routes = require('./routes/index');
var users = require('./routes/users');
var addopp = require('./routes/addopp');
var profile = require('./routes/profile');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Organism = require('./models/organism_model.js');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//connect to mongo
mongoose.connect('mongodb://simplyk-org:Oeuf2poule@ds021999.mlab.com:21999/heroku_ggjmn8rl?connectTimeoutMS=70000');


app.use(session({
	cookieName: 'session',
	secret: 'rcmscgsamfon81152627lolmamparohu,,loui',
	activeDuration: 1500 * 60 * 1000
}));



app.use(stormpath.init(app, {
	// WARNING: USING THIS ONLY DURING TEST PROCESS, DON'T PUT IT IN PRODUCTION IN HEROKU
	apiKey: {
		id: '6PUTYR1PU3WZ7BW7PUSH8D8CF',
		secret: 'wM6YrTbfIU4jeJ/XpbhTuevsOoUBMoaeYUAXJOGklG0'
	},
	application: {
		href: `https://api.stormpath.com/v1/applications/4VwVIc6IoowGSfAE594Rv7`
	},
	//WARNING END
	web: {
		register: {
			form: {
				fields: {
					name: {
						enabled: true,
						label: 'Organism Name',
						name: 'name',
						required: true,
						type: 'text'
					}
				}
			}
		},
		login: {
			nextUri: "/dashboard",
			form: {
				fields: {
					login: {
						label: 'Your Username or email',
						placeholder: 'email@trustyapp.com'
					},
					password: {
						label: 'Your password'
					}
				}
			}
		},
		login: {
			enabled: true,
			nextUri: "/dashboard"
		},
		logout: {
			enabled: true,
			nextUri: '/'
		}
	},
	expand: {
		customData: true,
	},
	preRegistrationHandler: function (formData, req, res, next) {
		var organism = new Organism({
			name: formData.name,
			email: formData.email
		});
		organism.save(function(err){
			if(err){
				var error = 'Something bad happened! Try again! Click previous !';
				console.log('@ organism.save : '+err);
				res.json({error: error});
			}
			else{
				Organism.findOne({'name': formData.name, 'email': formData.email}, 'id', function(err, organism){
					if(err){
						var error = 'Something bad happened! Try again! Click previous !';
						console.log('@ organism.findone : '+err);
						res.json({error: error + '    ' + err});
					}
					else{
						req.session.organism_id = organism._id;
						console.log('organism.id = ' + organism._id);
						next();
					}
				})
			}
		})
	},
	postRegistrationHandler: function(account, req, res, next){
		account.customData.id = req.session.organism_id;
		account.customData.save();
		console.log('Organism:', account.customData.id, 'has just been registered! ');
		next();
	},
	postLoginHandler: function (account, req, res, next) {
		console.log('Organism:', account.customData.id, 'just logged in! ');
		next();
	}
}));


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/addopp', addopp);
app.use('/profile', profile);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

app.on('stormpath.ready', function () {
	console.log('Stormpath Ready!');
});


module.exports = app;
