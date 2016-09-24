var mongoose = require('mongoose');

var buyersAgentModel = new mongoose.Schema({
	name: {type: 'String'},
	phoneNum: {type: 'String', unique: true, required: true},
	queue: [{
		showingId: {type: mongoose.Schema.Types.ObjectId, ref: 'showings'},
		listingId: {type: mongoose.Schema.Types.ObjectId, ref: 'listings'},
		timeFeedbackRequested: {type: 'Date'},
		requestCount: {type: 'Number'}
	}]
})

module.exports = mongoose.model('buyersagents', buyersAgentModel);