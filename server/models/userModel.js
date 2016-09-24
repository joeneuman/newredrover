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
	picture: {type: 'String'},
	stripeTokenCard: {type: 'String'},
	stripeCustomerInfo: {type: 'String'},
	customerId: {type: 'String'},
	randomEmail: {type: 'String'},
	twilioNumber: {type: 'String'},
	mls: {type: 'String'},
	cardId: {type: 'String'},
	cardLast4: {type: 'String'},
	agentId: {type: 'String', unique: true, required: true}
	// mlsListings: {type: 'String'}
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
			console.log('err', err);
			dfd.reject(err);
		}
		else {
			dfd.resolve(isMatch);
		}
	});
	return dfd.promise;
};

module.exports = mongoose.model('users', userModel);

