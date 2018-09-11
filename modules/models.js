var mongoose = require('mongoose');

var schema = mongoose.Schema;

var userSchema = new schema({
	handle: {type: String, required: true, unique: true},
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true},

	created: {type: Date, default: Date.now},
	updated: {type: Date, default: Date.now}
});

var sessionSchema = new schema({
	id: {type: String, required: true, unique: true},
	handle: {type: String, required: true},
	expired: {type: Boolean, default: false},
	
	created: {type: Date, default: Date.now},
	updated: {type: Date, default: Date.now}
});

var User = mongoose.model("User", userSchema);
var Session = mongoose.model("Session", sessionSchema);

module.exports.User = User;
module.exports.Session = Session;