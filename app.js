const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const port = 3001;
const path = require('path');
const mongo = require('mongodb').MongoClient;
const crypto = require('crypto');

app.use(express.static('public'));
app.use('/img',express.static(path.join(__dirname, 'public/images/')))
const geo = require('geoip-lite');

var userList = [];

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html')
});

mongo.connect('mongodb://127.0.0.1/chatroom', { useNewUrlParser: true }, function(err, client) {
	if (err) {
		throw err;
	}
	console.log('MongoDB connected...');
	var chat = client.db('chats');
	console.log('SERVER: chats made');
	io.on('connection', function(socket, req) {
		//MAKE SURE TO SWITCH THIS BEFORE U COMMIT
		//var address = socket.request.socket.remoteAddress;
		var address = socket.handshake.headers['x-real-ip']; 
		console.log('socketid:' + socket.id);
		//console.log(socket.handshake.headers);
		var hash = crypto.createHash('md5').update(address).digest('base64');
		console.log('SERVER: hashed ip' + address + ' to: ' + hash);
		console.log('SERVER: user connected, IP: ' + address + ' number of users connected: ' + userList.length);
		//geolocation
		var locationData = geo.lookup(address);
		//console.log(locationData);
		var state = null;
		var country = null;
		if (locationData != null) {
			state = locationData.region;
			country = locationData.country;
			console.log('SERVER: connected from ' + state);
		} 
		
		//add to userlist
		var userObject = {
			address: address,
			country: country,
			hash: hash.substring(0,5),
			socket: socket.id
		};
		userList.push(userObject);
		io.emit('refresh user list', userList);

		//on disconnect
		socket.on('disconnect', function() {
			var index = userList.indexOf(userObject);
			userList.splice(index, 1);
			io.emit('refresh user list', userList);
			console.log('SERVER: user disconnected, IP: ' + address + ' number of users connected: ' + userList.length);
		});
		
		//output previous messages for connecting user
		chat.collection('chats').find({}, {time: 1, name: 1, message: 1, hash: 1}).limit(100).sort({_id:1}).toArray(function(err, res){
			if (err) {
				throw err;
			}
			console.log('SERVER: emitting entire chat.collection');
			socket.emit('output',res);
		});
		//on input
		socket.on('input', function(data) {
			console.log('SERVER: 1. input recieved from ' + address + ' CONTENTS: ' + data.message);
			if (data.message == "") {
				console.log('SERVER: 2. no message detected');
			} else {
				console.log('SERVER: 2. inserting post')
				var messageObject = {
					time: (new Date).getTime(),
					address: address,
					name: data.name,
					message: data.message,
					hash: hash,
					state: state,
					country: country
				};
				//insert to mongodb
				chat.collection('chats').insertOne(messageObject);
				//wrap messageObject in array and emit out 
				var messageObjectArray = [messageObject]
				io.emit('output',messageObjectArray);
				console.log('SERVER: 3. emitting  chat.collection to everyone');
			}
		});
		//on clear drop db
		socket.on('clear', function(data){
			console.log('SERVER: database cleared!!!');
			chat.collection('chats').drop(function() {
				console.log('SERVER: cleared emitted...');
				io.emit('cleared');
			});
		});
	});
});

server.listen(port, function() {
	console.log(`listening on port ${port}`)
});
