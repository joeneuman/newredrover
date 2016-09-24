module.exports = {
	port: 4000,
	mongoUri: 'mongodb://localhost:27017/redrover',
	session: {
		sessionSecret: 'redrover50',
		saveUninitialized: 'true',
		resave: true
	}

};
