const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const port = 3001;

const mongo = require('mongodb').MongoClient;
const crypto = require('crypto');

app.use(express.static('public'));

const geo = require('geoip-lite');



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
	io.on('connection', function(socket) {
		var address = socket.request.socket.remoteAddress;
		var hash = crypto.createHash('md5').update(address).digest('base64');
		console.log('SERVER: hashed ip' + address + ' to: ' + hash);
		console.log('SERVER: user connected, IP: ' + address);
		//geolocation
		var locationData = geo.lookup(address);
		var state = null;
		if (locationData != null) {
			state = geo.lookup(address).region;
			console.log('SERVER: connected from ' + state);
		} else {
			state = 'DC';
		}
		//on disconnect
		socket.on('disconnect', function() {
			console.log('SERVER: user disconnected, socketId: ' + address);
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
					state: state
				};
				//insert to mongodb
				chat.collection('chats').insertOne(messageObject);
				//NEW: send this thing out 
				var messageObjectArray = [messageObject]
				io.emit('output',messageObjectArray);
				console.log('SERVER: 3. emitting  chat.collection to everyone');
				//OLD: retrieve latest and send to all
				// chat.collection('chats').find({}, {time: 1, name: 1, message: 1, hash: 1}).limit(1).sort({_id:-1}).toArray(function(err, res){
					// if (err) {
						// throw err;
					// }
					// console.log('SERVER: 3. emitting  chat.collection to everyone');
					// io.emit('output',res);
				// });
			}
		});
		
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
