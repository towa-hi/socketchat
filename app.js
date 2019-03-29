const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const port = 3000;

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
		var chat = client.db('chats');
		console.log('user connected, socketId: ' + socket.id);
		socket.on('disconnect', function() {
			console.log('user disconnected, socketId: ' + socket.id);
		});
		
		// socket.on('chat message', function(msg) {
			// console.log('message: ' + msg);
			// io.emit('chat message', msg);
		// });
		
		chat.collection('chats').find().limit(100).sort({_id:1}).toArray(function(err, res){
			if (err) {
				throw err;
			}
			console.log('SERVER: emitting  chat.collection');
			socket.emit('output',res);
		});
		
		socket.on('input', function(data) {
			console.log('SERVER: input recieved from ' + socket.id + ' contents: ' + data);
			console.log('SERVER: input processing...');
			var message = data;
			if (message == "") {
				console.log('no message!!');
			} else {
				chat.collection('chats').insertOne({time: (new Date).getTime(), userId: socket.id, message: message}, function() {
					console.log('SERVER: output emitted...');
					client.emit('output',data);
				});
			}
			chat.collection('chats').find().limit(1).sort({_id:-1}).toArray(function(err, res){
				if (err) {
					throw err;
				}
				console.log('SERVER: emitting  chat.collection to everyone');
				io.emit('output',res);
			});
		});
		
		socket.on('clear', function(data){
			chat.remove({}, function() {
				socket.emit('cleared');
			});
		});
	});
});





server.listen(port, function() {
	console.log(`listening on port ${port}`)
});
