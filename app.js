const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const port = 3001;

const mongo = require('mongodb').MongoClient;


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
		var chat = client.db('chats');
		console.log('user connected, IP: ' + address);
		socket.on('disconnect', function() {
			console.log('user disconnected, socketId: ' + address);
		});
		
		chat.collection('chats').find().limit(100).sort({_id:1}).toArray(function(err, res){
			if (err) {
				throw err;
			}
			console.log('SERVER: emitting  chat.collection');
			socket.emit('output',res);
		});
		
		socket.on('input', function(data) {
			console.log('SERVER: input recieved from ' + socket.id + ' contents: ' + data.message);
			console.log('SERVER: input processing...');
			if (data.message == "") {
				console.log('no message!!');
			} else {
				chat.collection('chats').insertOne({
					time: (new Date).getTime(), 
					address: address, 
					name: data.name,
					message: data.message
					}, function() {
					
					console.log('SERVER: output emitted...');
					
					client.emit('output',data);
				});
			
				chat.collection('chats').find().limit(1).sort({_id:-1}).toArray(function(err, res){
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
