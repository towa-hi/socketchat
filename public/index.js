$(function(){
	var socket = io();
	$('form').submit(function(e){
		e.preventDefault();
		var messageString = $('#m').val();
		if (messageString != ''){
			if (messageString.length <= 300) {
				var data = {
					name: 'Anonymous',
					message: messageString
				}
				console.log('CLIENT: emitting: ' + messageString);
				socket.emit('input', data);
				$('#m').val('');
				return false;
			} else {
				alert("message too long!!");
			}
		}
	});
	socket.on('output', function(data) {
		console.log('CLIENT: recieving output. array length: ' + data.length);
		if (data.length) {
			if (data.length > 1) {
				document.getElementById('messages').innerHTML = "";
				console.log('CLIENT DEBUG: cleared messages locally because client reconnected');
			}
			for (var count = 0; count < data.length; count++) {
				var message = document.createElement('div');
				var formattedTime = new Date(data[count].time);
				var timeString = formattedTime.toLocaleTimeString('en-US');
				//var flagString = '<img src="http://127.0.0.1:8080/' + data[count].state.toLowerCase() + '.png">'
				//var flagString = data[count].state + ' ' + data[count].country;
				var flagString = '<img style="vertical-align:middle" src="http://18.218.147.148:8080/countryballs/unknown.png">';
				if (data[count].country != null){
					flagString = '<img style="vertical-align:middle" src="http://18.218.147.148:8080/countryballs/' + data[count].country.toLowerCase() + '.png">';
				}
				var hashString = data[count].hash.substring(0,5);
				message.setAttribute('class', 'chat-message');
				var postInfoElement = document.createElement('div');
				postInfoElement.setAttribute('class', 'chat-message-info');
				var dateElement = document.createElement('div');
				dateElement.setAttribute('class', 'chat-date-info');
				dateElement.innerHTML = timeString;
				postInfoElement.appendChild(dateElement);
				var flagElement = document.createElement('div');
				flagElement.setAttribute('class', 'chat-flag-info');
				flagElement.innerHTML = flagString;
				postInfoElement.appendChild(flagElement);
				var nameElement = document.createElement('div');
				nameElement.setAttribute('class', 'chat-name-info');
				nameElement.innerHTML = hashString + ':';
				postInfoElement.appendChild(nameElement);
				var messageElement = document.createElement('div');
				messageElement.setAttribute('class', 'chat-message-contents');
				messageElement.innerHTML = data[count].message;
				//message.innerHTML = dateElement.toString() + flagElement + nameElement + messageElement;
				message.appendChild(postInfoElement);
				message.appendChild(messageElement);
				messages.appendChild(message);
				//console.log('CLIENT DEBUG: message:' + data[count].message);
			}
		}
		shouldScroll = messagesContainer.scrollTop + messagesContainer.clientHeight === messagesContainer.scrollHeight;
		
		if (!shouldScroll) {
			scrollToBottom();
		}
	});
	// clear.addEventListener('click', function() {
		// socket.emit('clear');
	// });
	socket.on('refresh user list', function(data) {
		userlist.innerHTML = '';
		for (var count = 0; count < data.length; count++) {
			var flagString = '<img style="vertical-align:middle" src="http://18.218.147.148:8080/countryballs/unknown.png">';
			if (data.country != null){
				flagString = '<img style="vertical-align:middle" src="http://18.218.147.148:8080/countryballs/' + data[count].country.toLowerCase() + '.png">';
			}
			var userElement = document.createElement('div');
			userElement.setAttribute('class', 'user-info');
			userElement.setAttribute('name', data[count].socket);
			var flagElement = document.createElement('div');
			flagElement.setAttribute('class', 'chat-flag-info');
			flagElement.innerHTML = flagString;
			userElement.appendChild(flagElement);
			var nameElement = document.createElement('div');
			nameElement.setAttribute('class','chat-name-info');
			nameElement.innerHTML = data[count].hash.substring(0,5);
			userElement.appendChild(nameElement);
			userlist.appendChild(userElement);
			console.log('CLIENT DEBUG: added user with socketid:' + socket.sessionid);
		}
	});
	// socket.on('a user disconnected', function(data) {
		// userlist.innerHTML = '';
	// });
	socket.on('cleared', function() {
		messages.innerHTML = '';
		
	});
	
});
function refreshUserList(data) {
	
	
	
}
function scrollToBottom() {
	messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

scrollToBottom();