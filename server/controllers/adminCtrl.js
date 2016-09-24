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