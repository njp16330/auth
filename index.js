var express = require("express");
var path = require("path");
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var apis = require('./modules/controllers.js');

var app = express(); 
var jsonparser = bodyParser.json();

mongoose.connect('mongodb://localhost:27017/authdb');
var db = mongoose.connection;

db.on('error', function(e){
	console.log('mongodb connection error: ' + e);
});

//API Endpoints
app.get('/', apis.index);

app.get('/api/users', apis.getUsers);
//app.get('/api/activeUsers', apis.getActiveUsers); // implement

app.get('/api/sessions', apis.getSessions);

app.post('/api/verify/:token', jsonparser, apis.login); // implement

app.post('/api/login', jsonparser, apis.login);
app.post('/api/register', jsonparser, apis.register);

app.post('/api/logout', jsonparser, apis.logout);

app.listen(8080);
//node server index.js