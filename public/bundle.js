/**
 * Created by brandonhebbert on 3/24/16.
 */
angular.module('redRoverApp').service('messageService', ["$http", function ($http) {


    this.notification = function (obj) {
        return $http({
            method: 'POST',
            url: '/api/twilio',
            data: obj
        });
    };
}]);

/*.put(SERVER_URL + '/api/twilio', obj).then(function (response) {
 return response.data;*/

module.exports = {
	port: 4000,
	mongoUri: 'mongodb://localhost:27017/redrover',
	session: {
		sessionSecret: 'redrover50',
		saveUninitialized: 'true',
		resave: true
	}
};
var express = require('express'),

	cors = require('cors'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	session = require('express-session'),
	passport = require('passport'),
	localStrategy = require('passport-local'),
	userCtrl = require('./controllers/userCtrl.js'),
	showingCtrl = require('./controllers/showingCtrl.js'),
	listingCtrl = require('./controllers/listingCtrl.js'),
	adminCtrl = require('./controllers/adminCtrl.js'),
	config = require('./config.js'),
	twilio = require('./controllers/twilioCtrl');
	// http = require('http');


passport.use('local', new localStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback : true
}, userCtrl.login));

passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

var app = express();
app.use(express.static(__dirname + './../public'));
app.use(bodyParser.json());
app.use(cors());
app.use(session({
    secret: config.session.sessionSecret,
    saveUninitialized: config.session.saveUninitialized,
    resave: config.session.resave
}));

app.use(passport.initialize());
app.use(passport.session());

//Auth Endpoints
app.post('/auth/login', passport.authenticate('local', {
	failureRedirect: '/#/login'
}), function(req, res) {
	/*console.log("trying to reroute");*/
	res.send(req.user);
	/*res.redirect('/#/listingagent');*/
});

app.get('/auth/logout', function(req, res, next) {
	req.session.destroy();
	req.logout();
	res.send();
});

//User Endpoints
app.post('/user/create', userCtrl.create);
app.post('/user/getUser', userCtrl.getUser);
app.put('/user/update/:_id', userCtrl.updateUserProfile);

//Listing Endpoints
app.post('/listing/create', listingCtrl.create);
app.post('/listing/requestSellerConnection', listingCtrl.requestSellerConnection);
app.get('/listing/connectSeller/:_id/:seller', listingCtrl.confirmSellerConnection);
app.put('/listing/removeSeller/:_id', listingCtrl.removeSellerConnection);
app.put('/listing/addListingAgreement/:_id', listingCtrl.addListingAgreement);
app.delete('/listing/delete/:_id', listingCtrl.delete);

//Showing Endpoints
app.post('/showing/create/:_id', showingCtrl.create);
app.put('/showing/addFeedbackToShowing/:_id', showingCtrl.addFeedbackToShowing);
app.delete('/showing/delete/:_id', showingCtrl.delete);

//Admin Endpoints
app.put('/admin/disableAgent/:_id', adminCtrl.disableAgent);
app.put('/admin/enableAgent/:_id', adminCtrl.enableAgent);
app.delete('/admin/deleteSeller/:_id', adminCtrl.deleteSeller);
app.delete('/admin/deleteAgent/:_id', adminCtrl.deleteAgent);
app.get('/admin/getAllListingAgents', adminCtrl.getAllListingAgents);
app.get('/admin/getAllBuyersAgents', adminCtrl.getAllBuyersAgents);
app.get('/admin/getAllListings', adminCtrl.getAllListings);
app.get('/admin/getAllSellers', adminCtrl.getAllSellers);
app.get('/admin/getAllShowings', adminCtrl.getAllShowings);

//Other
app.post('/seller', userCtrl.createSeller);
app.post('/buyersAgent', userCtrl.createBuyersAgent);

app.post('/twilio', twilio.sendTextMessage);
app.post('/twilio/return', twilio.returnMessage);


var mongoUri = config.mongoUri;
mongoose.connect(mongoUri);
mongoose.connection.once('open', function () {
    console.log('Connected to MongoDB');
});


app.listen(config.port, function () {
    console.log('Listening on port: ' + config.port);
});
var User = require('../models/userModel');
var Seller = require('../models/sellerModel');
var BuyersAgent = require('../models/buyersAgentModel');
var Listing = require('../models/listingModel');
var Showing = require('../models/showingModel');

module.exports = {

	enableAgent: function(req, res, next) {
		User.findById(req.params._id, function(err, user) {
			if (err) res.sendStatus(500);
			else {
				user.enabled = true;
				user.save(function(err, result) {
					if (err) res.sendStatus(500);
					else res.send(result);
				});
			}
		});
	},

	disableAgent: function(req, res, next) {
		User.findById(req.params._id, function(err, user) {
			if (err) res.sendStatus(500);
			else {
				user.enabled = false;
				user.save(function(err, result) {
					if (err) res.sendStatus(500);
					else res.send(result);
				});
			}
		});
	},

	getAllListingAgents: function(req, res, next) {
		User
			.find({permissions: 'ListingAgent'})
			.exec(function(err, listingAgents) {
				if (err) res.sendStatus(500);
				else res.send(listingAgents);
			});
	},

	getAllBuyersAgents: function(req, res, next) {
		BuyersAgent
			.find({})
			.exec(function(err, buyersAgents) {
				if (err) res.sendStatus(500);
				else res.send(buyersAgents);
			});
	},

	getAllSellers: function(req, res, next) {
		Seller
			.find({})
			.exec(function(err, sellers) {
				if (err) res.sendStatus(500);
				else res.send(sellers);
			});
	},

	getAllListings: function(req, res, next) {
		Listing
			.find({})
			.exec(function(err, listings) {
				if (err) res.sendStatus(500);
				else res.send(listings);
			});
	},

	getAllShowings: function(req, res, next) {
		Showing
			.find({})
			.exec(function(err, showings) {
				if (err) res.sendStatus(500);
				else res.send(showings);
			});
	},

	deleteSeller: function(req, res, next) {
		Seller.findByIdAndRemove(req.params._id, function(err, result) {
			if (err) res.sendStatus(500);
			else res.send(result);
		});
	},

	deleteAgent: function(req, res, next) {
		User.findByIdAndRemove(req.params._id, function(err, result) {
			if (err) res.sendStatus(500);
			else res.send(result);
		});
	}
}
var Listing = require('../models/listingModel');

module.exports = {

	create: function(req, res, next) {
		var newListing = new Listing(req.body);
		newListing.save(function(err, result) {
			if (err) res.sendStatus(500);
			else res.send(result);
		});
	},

	requestSellerConnection: function(req, res, next) {
		
	},

	confirmSellerConnection: function(req, res, next) {
		Listing.findById(req.params._id, function(err, listing) {
			if (err) res.sendStatus(500);
			else {
				listing.seller = req.params.seller;
				listing.save(function(err, result) {
					if (err) res.sendStatus(500);
					else res.send(result);
				});
			}
		});
	}, 

	removeSellerConnection: function(req, res, next) {
		Listing.findById(req.params._id, function(err, listing) {
			listing.seller = null;
			listing.save(function(err, result) {
				if (err) res.sendStatus(500);
				else res.send(result);
			});
		});
	},

	addListingAgreement: function(req, res, next) {
		Listing.findById(req.params._id, function(err, listing) {
			listing.agreement = req.body.agreement;
			listing.save(function(err, result) {
				if (err) res.sendStatus(500);
				else res.send(result);
			});
		});
	},

	delete: function(req, res, next) {
		Listing.findByIdAndRemove(req.params._id, function(err, listing) {
			if (err) res.sendStatus(500);
			else res.send(listing);
		});
	}
}
var Showing = require('../models/showingModel');

module.exports = {

    create: function (req, res, next) {
        var newShowing = new Showing();
        newShowing.listing = req.params._id;
        newShowing.buyersAgent = req.body._id;
        newShowing.dateCreated = new Date();
        newShowing.requestDate = req.body.requestDate;
        newShowing.save(function (err, result) {
            if (err) {
                res.sendStatus(500)
            } else {
                res.send(result);
            }
        });
    },

    addFeedbackToShowing: function(req, res, next) {
        Showing.findById(req.params._id, function(err, showing) {
            if (err) {
                res.sendStatus(500);
            }
            else {
                showing.feedback = req.body.feedback;
                showing.save(function(err, result) {
                    if (err) {
                        res.sendStatus(500);
                    }
                    else res.send(result)
                });
            }
        });
    },

    delete: function(req, res, next) {
        Showing.findByIdAndRemove(req.params._id, function(err, showing) {
            if (err) res.sendStatus(500);
            else res.send(showing);
        });
    }
};
/**
 * Created by brandonhebbert on 3/24/16.
 */

var client = require('twilio')('ACec65ec8a176a0c2c14b673ac91e527d3', 'd29c5974fc198697c9fe891d928d1a36');

module.exports = {
    sendTextMessage: function (req, res) {
        console.log("sending message");
        client.messages.create({
            // to: req.body.phonenumber,
            to: '+18014719992',
            from: '+14352169949',
            body: "george" + " you have a showing request for " + "12 pm" + " please reply with a 'yes' or 'no' within" +
            "10 minutes."
        }, function (err, data) {
            console.log(err, data);
            if (err) {
                res.status(500).send('failed to send');
            } else {
                res.json(data);
            }
        });
    },

    returnMessage: function (req, res) {
        console.log(req);
        client.messages.create({
            // to: req.body.phonenumber,
            to: '+18014719992',
            from: '+14352169949',
            body:  "you have a showing request"
        }, function (err, data) {
            console.log(err, data);
            if (err) {
                res.status(500).send('failed to send');
            } else {
                res.json(data);
            }
        });
        // if (twilio.validateExpressRequest(req, 'YOUR_AUTH_TOKEN')) {
        //     var twiml = new twilio.TwimlResponse();
        //     req.body = req.body.lowercase();
            //Validate that this request really came from Twilio...
            /*if (twilio.validateExpressRequest(req, 'YOUR_AUTH_TOKEN')) {
                var twiml = new twilio.TwimlResponse();*/

              /*  twiml.say('Hi!  Thanks for checking out my app!')
                    .play('http://myserver.com/mysong.mp3');

                res.type('text/xml');
                res.send(twiml.toString());
            }*/
            // else {
            //     res.send('you are not twilio.  Buzz off.');
            // }
        // });

        /*if (req.body === 'no')
            res.send('No WAY!');
        client.messages.create({
            to: "",
            from: '+14352169949',
            body: " "
            // body:  "req.body.name " + "you have a showing request at " + " req.body.time" + " please respond within 10min."
        }, function (err, data) {
            console.log(err, data);
            if (err) {
                res.status(500).send('failed to send');
            } else {
                res.json(data);
            }
        });*/
    }
    // }
};
var User = require('../models/userModel');
var Seller = require('../models/sellerModel');
var BuyersAgent = require('../models/buyersAgentModel');

module.exports = {

	login: function( req, email, password, done) {
		console.log(email, password);
		process.nextTick(function() {
		    User.findOne({ 'email': email }, function (err, user) {
		  		if (err) {
	                return done(err);
	            } else if (user) {
	                user.validPassword(password)
	                .then(function(response) {
	                	console.log('response',response);
	                    if (response === true) {
	                        /*req.user = user;*/
	                        return done(null, user);
	                    } else {
	                        return done('Password incorrect', false);
	                    }
	                })
	                .catch(function(err) {
	                	console.log('err', err);
	                    return done('Server Error', false);
	                });
	            } else {
	                return done('User not found', false);
	            }
			});
		});
	},

	create: function(req, res, next) {
		var newUser = new User();
		newUser.companyName = req.body.companyName;
		newUser.email = req.body.email;
		newUser.phoneNum = req.body.phoneNum;
		newUser.permissions = ['ListingAgent'];
		newUser.enabled = true;
		newUser.picture = req.body.picture;
		newUser.generateHash(req.body.password).then(function(password) {
			newUser.password = password;
			newUser.generateHash(req.body.pinNum).then(function(pinNum){
				newUser.pinNum = pinNum;
				newUser.save(function(err, result) {
					if (err) {
						res.sendStatus(500);
					}
					 else res.send(result);
				});
			});			
		});
	},

	updateUserProfile: function(req, res, next) {
		User.findById(req.params._id, function(err, user) {
			if (err) res.sendStatus(500);
			else {
				user.generateHash(req.body.password).then(function(response) {
					user.password = response;
					user.companyName = req.body.companyName;
					user.email = req.body.email;
					user.phoneNum = req.body.phoneNum;
					user.picture = req.body.picture;
					user.save(function(err, result) {
						if (err) {
							res.sendStatus(500);
						}
						else res.send(result);
					});
				});
			}
		});
	},

	getUser: function(req, res, next) {
		User.findOne({email: req.body.email}, function(err, user) {
			if (err) {
				res.sendStatus(500);
			}
			else res.send(user);
		});
	},

	createSeller: function(req, res, next) {
		var newSeller = new Seller(req.body);
		newSeller.save(function(err, result) {
			if (err) res.sendStatus(500);
			else res.send(result);
		});

	},

	createBuyersAgent: function(req, res, next) {
		var newBuyersAgent = new BuyersAgent(req.body);
		newBuyersAgent.save(function(err, result) {
			if (err) res.sendStatus(500);
			else res.send(result);
		});
	}
}
var mongoose = require('mongoose');

var buyersAgentModel = new mongoose.Schema({
	userName: {
		firstName: {type: 'String'},
		lastName: {type: 'String'}
	},
	phoneNum: {type: 'String', unique: true, required: true}
})

module.exports = mongoose.model('buyersAgents', buyersAgentModel);
var mongoose = require('mongoose');

var listingModel = new mongoose.Schema({
	address: {type: 'String'},
	taxId: {type: 'String'},
	mlsId: {type: 'String'},
	listingAgentId: {type: 'String'},
	listingAgent: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
	sellerPhone: {type: 'String'},
	sellerName: {type: 'String'},
	agreement: {type: 'String'},
	active: {type: 'Boolean'},
	picture: {type: 'String'} //html link?
});

module.exports = mongoose.model('listings', listingModel);
var mongoose = require('mongoose');

var sellerModel = new mongoose.Schema({
	userName: {
		firstName: {type: 'String'},
	},
	phoneNum: {type: 'String', unique: true, required: true},
})

module.exports = mongoose.model('sellers', sellerModel);
var mongoose = require('mongoose');

var showingModel = new mongoose.Schema({
	listing: {type: mongoose.Schema.Types.ObjectId, ref: 'listings'},
	buyersAgent: {type: mongoose.Schema.Types.ObjectId, ref: 'agents'},
	dateCreated: {type: 'Date'},
	requestDate: {type: 'Date'},
	feedback: {type: 'String'}
});

module.exports = mongoose.model('showings', showingModel);
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var q = require('q');

var userModel = new mongoose.Schema({
	companyName: {type: 'String'},
	email: {type: 'String', unique: true, required: true},
	phoneNum: {type: 'String', unique: true, required: true},
	password: {type: 'String'},
	pinNum: {type: 'String'},
	permissions: [{type: 'String', enum: ['Admin', 'ListingAgent']}],
	enabled: {type: 'Boolean'},
	sellers: [{type: mongoose.Schema.Types.ObjectId, ref: 'sellers'}],
	properties: [{type: mongoose.Schema.Types.ObjectId, ref: 'properties'}],
	picture: {type: 'String'} //html link?
});

userModel.methods.generateHash = function (hashee) {
	var dfd = q.defer();
	bcrypt.genSalt(10, function (err, salt) {
		if (err) {
			dfd.reject(err);
		}
		bcrypt.hash(hashee, salt, null, function (err, hash) {
			hashee = hash;
			dfd.resolve(hashee);
		});
	});
	return dfd.promise;
};

userModel.methods.validPassword = function (hashee) {
	var dfd = q.defer();

	bcrypt.compare(hashee, this.password, function (err, isMatch) {
		if (err) {
			dfd.reject(err);
		}
		else {
			dfd.resolve(isMatch);
		}
	});
	return dfd.promise;
};

module.exports = mongoose.model('users', userModel);