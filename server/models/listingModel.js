var mongoose = require('mongoose');

var listingModel = new mongoose.Schema({
	address: {type: 'String'},
	state: {type: 'String'},
	postalCode: {type: 'String'},
	city: {type: 'String'},
	price: {type: 'String'},
	taxId: {type: 'String'},
	mlsId: {type: 'String'},
	listingId: {type: 'String'},
	listingAgentId: {type: 'String'},
	listingAgent: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
	seller: {type: mongoose.Schema.Types.ObjectId, ref: 'sellers'},
	agreement: {type: 'String'},
	active: {type: 'Boolean'},
	picture: {type: 'String'}, //html link?
	agent: {type: 'String'}, //testing current user
	lotAcres: {type: 'String'},
	totalBedRooms: {type: 'String'},
	totalBathRooms: {type: 'String'},
	yearBuilt: {type: 'String'},
	exterior: {type: 'String'},
	mainSqFt: {type: 'String'},
	basementSqFt: {type: 'String'},
	zoning: {type: 'String'},
	garageParking: {type: 'String'},
	garageCapacity: {type: 'String'},
	publicRemarks: {type: 'String'},
	privateRemarks: {type: 'String'},
	listingClass: {type: 'String'},
	levels: {type: 'String'},
	heating: {type: 'String'},
	airConditioning: {type: 'String'},
	randomNum: {type: 'Number'},
	timeSlotsUnavailable: [{type: 'Date'}],
	showings: [{type: mongoose.Schema.Types.ObjectId, ref: 'showings'}]
});

module.exports = mongoose.model('listings', listingModel);