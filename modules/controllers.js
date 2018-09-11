var path = require("path");
var models = require('./models.js');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
var uuidV1 = require('uuid/v1');

var saltRounds = 11;

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nisarg.altimatech@gmail.com',
    pass: 'bd220791gj13'
  }
});

var index = function(req, res){
	res.sendFile(path.join(__dirname + '/../public/index.html'));
};

var getUsers = function(req, res){
	models.User.find({}, function(err, users){
		if(err) res.json({status: false, error: err});
		else res.json(users);
	});
};
var getSessions = function(req, res){
	models.Session.find({}, function(err, sessions){
		if(err) res.json({status: false, error: err});
		else res.json(sessions);
	});
};

var hashPassword = function(pass, callback, error){
	bcrypt.genSalt(saltRounds, function(err, salt) {
		if(err) {
			if(error) error(err);
			return;
		}

	    bcrypt.hash(pass, salt, function(err, hash) {
	    	if(err) {
				if(error) error(err);
				return;
			}
	        if(callback) callback(hash);
	    });
	});
};

var login = function(req, res){
	
	//get user by email
	models.User.find({email: req.body.email}, function(err, data){
		if(err) res.json({status: false, error: err});
		else{
			if(data && data.length){
				var user = data[0];

				//console.log(user);
				bcrypt.compare(req.body.password, user.password, function(err, match) {

				    if(match){

				    	//check if session exists
						//else do below
						var session = new models.Session({
							id: uuidV1(),
							handle: user.handle
						});

						session.save(function(err){
							if(err){
								res.json({ status: false, error: err});
							}
							else {
								res.json({user: user, session: session});
							}
						});
				    }
				    else{
				    	res.json({status: false, error: 'Email and password combination is incorrect.'});
				    }
				});
			}
			else{
				res.json({status: false, error: 'Email and password combination not found.'});
			}
		}

	});
	//res.json(req.body);
};
var logout = function(req, res){
	models.Session.findOne({id: req.body.sessionId}).exec(function(err, sess){
		if(err) res.json({status: false, error: err});
		else{
			if(sess.expired)res.json({status: true, message: 'Logout successful.'});
			else{
				sess.expired = true;
				sess.save(function(err){
					if(err)	res.json({status: false, error: err});
					else 
						res.json({status: true, message: 'Logout successful.'});
				});
			}
		}
	})
};

var register = function(req, res){
	//check if handle or email exists
	models.User.count().or([{email: req.body.email}, {handle: req.body.handle}]).exec(function(err, userCount){
		if(userCount){
			res.json({status: false, error: 'User exists with email and/or handle'});
		}
		else{
			hashPassword(req.body.password, function(hash){
				var user = new models.User({
					email: req.body.email,
					handle: req.body.handle,
					password: hash
				});

				user.save(function(err){
					if(err) res.json({status: false, error: err});
					else{
						res.json({status: true, message: 'Registration complete. Please login now.'});
						/*if(req.body.email){
							transporter.sendMail({
							    from: 'nisarg.altimatech@gmail.com',
							    to: req.body.email,
							    subject: 'Trying to login',
							    text: 'You have successfully logged in...'
							}, 
							function(error, info){
							  	if (error) {
							    	console.log(error);
							  	} else {
							    	console.log('Email sent: ' + info.response);
							  	}

							  	res.json({status: true, msg: 'you have completed stage 1'});
							});
						}*/
					}
				});
			});
		}
	})
	//else create the user with hashed password
};

module.exports.index = index;

module.exports.getUsers = getUsers;
module.exports.getSessions = getSessions;

module.exports.login = login;
module.exports.logout = logout;
module.exports.register = register;

//verify
//in users schema there has to be a verified field
//user mongo's default _id field as the token to verify

//getActiveUsers
//get all users from all active sessions (expired:false)

//create an email with karianu/gmail to user for this and use the right protocol to bypass the google security thing
//after this update the registration/login api to complete registration after verification