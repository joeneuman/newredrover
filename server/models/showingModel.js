var mongoose = require('mongoose');

var showingModel = new mongoose.Schema({
	listing: {type: mongoose.Schema.Types.ObjectId, ref: 'listings'},
	status: {type: 'String', enum: ['pending', 'confirmed', 'cancelled', 'feedback-requested']},
	buyersAgent: {type: mongoose.Schema.Types.ObjectId, ref: 'buyersagents'},
	dateCreated: {type: 'Date'},
	timeSlot: {type: 'Date'}, //time and day
	feedback: {type: 'String'}
});

module.exports = mongoose.model('showings', showingModel);