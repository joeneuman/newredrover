var mongoose = require('mongoose');

var sellerModel = new mongoose.Schema({
	sellerName: {
		firstName: {type: 'String'}
	},
	phoneNum: {type: 'String', unique: true, required: true},
	queue: [{
		listingId: {type: mongoose.Schema.Types.ObjectId, ref: 'listings'},
		showing: {type: mongoose.Schema.Types.ObjectId, ref: 'showings'},
		timeRequested: {type: 'String'},
		showingTime: {type: 'Date'},
		buyersAgent: {type: mongoose.Schema.Types.ObjectId, ref: 'buyersagents'},
		requestCount: {type: 'Number'}
	}]
});

module.exports = mongoose.model('sellers', sellerModel);