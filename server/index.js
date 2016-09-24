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
	twilio = require('./controllers/twilioCtrl'),
	stripe = require('./controllers/stripeCtrl.server.js'),
	BuyersAgent = require('./models/buyersAgentModel'),
	Seller = require('./models/sellerModel.js'),
	Listing = require('./models/listingModel.js'),
	Showing = require('./models/showingModel.js'),
	User = require('./models/userModel.js'),
	q = require('q'),
	request = require('request');

var minutesToDelay = 15;
var morningHourCutoff = 7;
var nightHourCutoff = 24;

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
}), listingCtrl.getListingsFromServer,listingCtrl.setListingStatusOnLogin, function(req, res) {

	res.send(req.user);
});

app.get('/auth/logout', function(req, res, next) {
	req.session.destroy();
	req.logout();
	res.send();
});

//User Endpoints
app.post('/user/create', userCtrl.create);
// app.put('/user/update/:id', userCtrl.updateUserProfile);
app.put('/user/update/:id', userCtrl.updateUser);
// app.post('/user/update/:id', userCtrl.updateUser);
app.put('/user/updateUserPassword/:id', userCtrl.updateUserPassword);
app.get('/user/getUser/:id', userCtrl.getUser);
app.get('/user/getUser/', userCtrl.getAllUsers);
app.get('/user/current', userCtrl.currentUser);
app.post('/user/createSeller', userCtrl.createSeller);
app.post('/user/checkEmail', userCtrl.checkEmail);
app.post('/user/phoneNumCheck', userCtrl.phoneNumCheck);

//Listing Endpoints
app.post('/listing/create', listingCtrl.create);
app.get('/listing/connectSeller/:_id/:seller', listingCtrl.confirmSellerConnection);
app.get('/listing/agentListings/:_id', listingCtrl.getListingsByAgent);
app.get('/listing/getListing/:id', listingCtrl.getListingById);
app.put('/listing/removeSeller/:_id', listingCtrl.removeSellerConnection);
app.put('/listing/editListing/:id', listingCtrl.updateListing);
app.put('/listing/addListingAgreement/:_id', listingCtrl.addListingAgreement);
app.delete('/listing/delete/:_id', listingCtrl.delete);
app.post('/listing/cancelTimeslot', listingCtrl.cancelTimeslot, twilio.showingCancelationNoticeToBuyersAgent);
app.post('/listing/uncancelTimeslot', listingCtrl.uncancelTimeslot);
// app.post('/test', listingCtrl.getListingsFromServer, listingCtrl.getListingsByAgent);

//Showing Endpoints
app.post('/showing/create/:id', showingCtrl.create);
app.put('/showing/addFeedbackToShowing/:_id', showingCtrl.addFeedbackToShowing);
app.delete('/showing/delete/:_id', showingCtrl.delete);
app.get('/showing/getShowing/:id', showingCtrl.getShowingsByListing);

/*this one*/

app.post('/showing/confirmShowingRequest', showingCtrl.confirmShowingRequest, userCtrl.addRequestToSellersQueue);
app.post('/showing/populateDatabaseWithShowings/:id', showingCtrl.populateDatabaseWithShowings);

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
// app.post('/buyersAgent', userCtrl.createBuyersAgent);

//Twilio Endpoints
app.post('/twilio/newShowingRequest', twilio.newShowingRequest);
app.post('/twilio/newShowingRequest', twilio.newShowingRequest, showingCtrl.confirmShowingRequest, userCtrl.addRequestToSellersQueue);
app.post('/twilio/findNumber/:id', twilio.findTwilioNumber);
app.post('/twilio/buyNumber/:id', twilio.buyTwilioNumber);
app.post('/twilio/checkNumber/:id', twilio.checkTwilioNumber);
app.post('/twilio/changePassword', twilio.resetPassword);
app.post('/twilio/sendUrlToSeller', twilio.sendUrlToSeller);
app.get('/twilio/return', twilio.returnMessage);


app.get('/twilio/something', function(req, res, next) {
	console.log('we hit something new');
});
/*>>>>>>> betaTestBranch*/

//Stripe Endpoints
app.post('/stripe/createUserSubscription', stripe.createUserWithSubscription);
app.post('/stripe/deleteAccount', stripe.deleteAccount);
app.put('/stripe/updateCard/:id', stripe.updateCard);


//RETS Server
// app.post('', rets.getListingByAgent);

var mongoUri = config.mongoUri;
mongoose.connect(mongoUri);
mongoose.connection.once('open', function () {
    console.log('Connected to MongoDB');
});


function showingTimeChecker() {
	showingCtrl.getShowingsPast()
		.then(function(showings) {
			showings.map(function(showing) {
				userCtrl.addShowingToBuyersAgentQueue(showing);
			});
			setTimeout(function() {
				showingTimeChecker();
			}, 5000);
		})
		.catch(function(err) {
			setTimeout(function() {
				showingTimeChecker();
			}, 5000);
		});
};
showingTimeChecker();

function requestBuyersAgentFeedback() {
	console.log('running requestBuyersAgentFeedback')
	var rightNow = new Date().getTime();
	BuyersAgent
		.find({ queue: { $gt: [] } })
		.populate({path: 'queue.listingId queue.showingId'})
		.exec(function(err, buyersAgents) {
			var options = {
				path: 'queue.listingId.listingAgent',
				model: 'users'
			}
			BuyersAgent.populate(buyersAgents, options, function(err, buyersAgentsPopulated) {
				if (err) return;
				else {
					console.log('buyersAgentsPopulated index', buyersAgentsPopulated);
					buyersAgentsPopulated.map(function(buyersAgent) {
						console.log('buyersAgent index', buyersAgent);
						if (buyersAgent.queue && buyersAgent.queue.length > 0 && buyersAgent.queue[0].requestCount >= 1 && (new Date(buyersAgent.queue[0].timeFeedbackRequested).getTime() + (1000 * 60 * minutesToDelay * buyersAgent.queue[0].requestCount) < rightNow)) {
							Showing.findById(buyersAgent.queue[0].showingId._id, function(err, showing) {
								if (err) return false;
								else {
									console.log('cancelling request');
									showing.feedback = 'Buyers agent has not responded to four feedback requests.';
									showing.save(function(err, showingSave) {
										if (err) return false;
										else {
											twilio.sendCancellationForFeedbackRequestToBuyersAgent(buyersAgent)
												.then(function(response) {
													if (response === true) {
														console.log('sent cancelation of request for feedback from buyers agent', response);
														buyersAgent.queue.splice(0, 1);
														buyersAgent.save(function(err, buyersAgentSave) {
															if (err) {
																console.log('error saving buyers agent after splicing', err);
																return false;
															}
															else {
																console.log('buyers agent save after splicing queue', buyersAgentSave)
																return buyersAgentSave;
															}
														});
													}
												})
												.catch(function(err) {
													console.log('error sending cancellation for feedback request to buyers agent');
													return err;
												})
											
										}
									})
								}
							})
						} else if (buyersAgent.queue && buyersAgent.queue.length > 0 && buyersAgent.queue[0].requestCount === 0) {
							console.log('sending request for feedback. Attempt: ', buyersAgent.queue[0].requestCount);
							twilio.requestBuyersAgentFeedback(buyersAgent);
							return;
						} else if (buyersAgent.queue && buyersAgent.queue.length > 0 && buyersAgent.queue[0].requestCount < 5 && (new Date(buyersAgent.queue[0].timeFeedbackRequested).getTime() + (1000 * 60 * minutesToDelay * buyersAgent.queue[0].requestCount) < rightNow)) {
							console.log('sending request for feedback. Attempt: ', buyersAgent.queue[0].requestCount);
							twilio.requestBuyersAgentFeedback(buyersAgent);
							return;
						}
					})
				}
			})
		})
}

function clearSellerRequestQueue() {
	console.log('running clearSellerRequestQueue');
	var rightNow = new Date().getTime();
	Seller
		.find({ queue: { $gt: [] } })
		.populate('queue.listingId queue.buyersAgent')
		.exec(function(err, sellers) {
			if (err) return err;
			else {
				console.log('sellers', sellers);
				sellers.map(function(seller) {
					if (seller.queue && seller.queue.length > 0 && (seller.queue[0].requestCount >= 5 || new Date(seller.queue[0].showingTime).getTime < (rightNow + (1000 * 60 * 15)))) {
						console.log('canceling showing request');
						Showing.findById(seller.queue[0].showing, function(err, showing) {
							if (err) return err;
							else {
								console.log('showing', showing);
								showing.status = 'cancelled';
								showing.save(function(err, showingSave) {
									if (err) {
										console.log('error saving showing', err);
										return err;
									}
									else {
										console.log('showingSave', showingSave);
										Listing.findById(seller.queue[0].listingId._id).populate('listingAgent').exec(function(err, listing) {
											if (err) return err;
											else {
												listing.timeSlotsUnavailable.push(seller.queue[0].showingTime);
												listing.save(function(err, listingSave) {
													if (err) return err;
													else {
														twilio.sendDenialToBuyersAgent(seller, listing)
															.then(function(response) {
																console.log('sent denial to buyers agent');
																if (response === true) {
																	seller.queue.splice(0, 1);
																	seller.save(function(err, sellerSave) {
																		if (err) {
																			console.log('error saving seller queue after splice', err);
																			return err;
																		}
																		else {
																			console.log('saved seller after splicing queue', sellerSave);
																			return sellerSave;																			
																		}
																	})
																}
															})
															.catch(function(err) {
																console.log('error sending cancellation: ', err);
																return err;
															});
													}
												})
											}
										})
									}
								})
							}
						})
					} else if (seller.queue && seller.queue.length > 0 && seller.queue[0].requestCount === 0){
						console.log('sending request to seller, request count: ', seller.queue[0].requestCount);
						Listing.findById(seller.queue[0].listingId).populate('listingAgent').exec(function(err, listing) {
							if (err) {
								console.log('error finding listing ', err);
								return err;
							} else {
								twilio.sendRequestToSellerFromQueue(seller, listing);
							}
						})
						return;
					} else if (seller.queue && seller.queue.length > 0 && (new Date(seller.queue[0].timeRequested).getTime() + (1000 * 60 * minutesToDelay * seller.queue[0].requestCount) < rightNow )) {
						console.log('sending request to seller attempt: ', seller.queue[0].requestCount);
						Listing.findById(seller.queue[0].listingId).populate('listingAgent').exec(function(err, listing) {
							if (err) {
								console.log('error finding listing ', err);
								return err;
							} else {
								twilio.sendRequestToSellerFromQueue(seller, listing);
							}
						})
						return;
					}
				})
			}
		})
}

function autoCancelMorningNightTimes() {
	var today = new Date();
	var timeSlotsToPush = {};

	for (var i = 0; i < 3; i++) {
		timeSlotsToPush['timeSlotUnavailable_' + i + '_1'] = new Date(today.getFullYear(), today.getMonth(), (today.getDate() + i), 9, 0, 0, 0)
		timeSlotsToPush['timeSlotUnavailable_' + i + '_2'] = new Date(today.getFullYear(), today.getMonth(), (today.getDate() + i), 9, 30, 0, 0)
		timeSlotsToPush['timeSlotUnavailable_' + i + '_3'] = new Date(today.getFullYear(), today.getMonth(), (today.getDate() + i), 10, 0, 0, 0)
		timeSlotsToPush['timeSlotUnavailable_' + i + '_4'] = new Date(today.getFullYear(), today.getMonth(), (today.getDate() + i), 10, 30, 0, 0)
		timeSlotsToPush['timeSlotUnavailable_' + i + '_5'] = new Date(today.getFullYear(), today.getMonth(), (today.getDate() + i), 23, 0, 0, 0)
		timeSlotsToPush['timeSlotUnavailable_' + i + '_6'] = new Date(today.getFullYear(), today.getMonth(), (today.getDate() + i), 23, 30, 0, 0)
		timeSlotsToPush['timeSlotUnavailable_' + i + '_7'] = new Date(today.getFullYear(), today.getMonth(), (today.getDate() + i), 24, 0, 0, 0)
		timeSlotsToPush['timeSlotUnavailable_' + i + '_8'] = new Date(today.getFullYear(), today.getMonth(), (today.getDate() + i), 24, 30, 0, 0)
	}

	listingCtrl.getAllListings().then(function(listings) {
		listings.map(function(listing) {
			var dfd = q.defer();
			for (var prop in timeSlotsToPush) {
				listing.timeSlotsUnavailable.push(timeSlotsToPush[prop]);
			}
			listing.save(function(err, listingSave) {
				if (err) return dfd.reject(err);
				else return dfd.resolve(listingSave);
			})
			return dfd.promise;
		})
	})
}

function updateListings() {
	User.find({}, function(err, users) {
		if (users) {
			users.map(function(user) {
				listingCtrl.updateListingAgentListings(user).then(function(response) {
					listingCtrl.setListingStatus(user, response);
				});
			})
		}
	})
}
updateListings();

/* Daily Function */
setInterval(function() {
	console.log('checking time');
	var rightNow = new Date();
	if (rightNow.getHours() === 7 && rightNow.getMinutes() === 0) {
		console.log('running daily upkeep');
		autoCancelMorningNightTimes();
		updateListings();
	}
}, (1000 * 59))

setInterval(function() {
	var rightNow = new Date().getHours();
	if (rightNow <= 2) {
		rightNow = rightNow + 24 - 2;
	} else {
		rightNow = rightNow - 2;
	}
	console.log(morningHourCutoff, rightNow, nightHourCutoff);
	if (morningHourCutoff <= rightNow && rightNow <= nightHourCutoff) {
		console.log('right time');
		requestBuyersAgentFeedback();
		clearSellerRequestQueue();
	}
}, (1000 * 60));
// requestBuyersAgentFeedback();
// clearSellerRequestQueue();


app.listen(config.port, function () {
    console.log('Listening on port: ' + config.port);
});