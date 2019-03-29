const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const port = 3001;

const mongo = require('mongodb').MongoClient;
const crypto = require('crypto');

app.use(express.static('public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html')
});

mongo.connect('mongodb://127.0.0.1/chatroom', function(err, client) {
	if (err) {
		throw err;
	}
	console.log('MongoDB connected...');
	
	io.on('connection', function(socket) {
		var address = socket.request.socket.remoteAddress;
		var hash = crypto.createHash('md5').update(address).digest('base64');
		console.log('SERVER: hashed ip' + address + ' to: ' + hash);
		var chat = client.db('chats');
		console.log('SERVER: user connected, IP: ' + address);
		socket.on('disconnect', function() {
			console.log('SERVER: user disconnected, socketId: ' + address);
		});
		
		chat.collection('chats').find({}, {time: 1, name: 1, message: 1, hash: 1}).limit(100).sort({_id:1}).toArray(function(err, res){
			if (err) {
				throw err;
			}
			console.log('SERVER: emitting  chat.collection');
			socket.emit('output',res);
		});
		
		socket.on('input', function(data) {
			console.log('SERVER: input recieved from ' + address + ' CONTENTS: ' + data.message);
			console.log('SERVER: input processing...');
			if (data.message == "") {
				console.log('no message!!');
			} else {
				
				chat.collection('chats').insertOne({
					time: (new Date).getTime(), 
					address: address, 
					name: data.name,
					message: data.message,
					hash: hash
					}, function() {
					
					console.log('SERVER: output emitted...');
					
					client.emit('output',data);
				});
			
				chat.collection('chats').find({}, {time: 1, name: 1, message: 1, hash: 1}).limit(1).sort({_id:-1}).toArray(function(err, res){
					if (err) {
						throw err;
					}
					console.log('SERVER: emitting  chat.collection to everyone');
					io.emit('output',res);
				});
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
