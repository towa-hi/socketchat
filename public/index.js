$(function(){
	var socket = io();
	$('form').submit(function(){
		var messageString = $('#m').val();
		if (messageString != ''){
			var data = {
				name: 'Anonymous',
				message: messageString
			}
			console.log('CLIENT: emitting: ' + messageString);
			socket.emit('input', data);
			$('#m').val('');
			return false;
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
				message.setAttribute('class', 'chat-message');
				message.textContent = timeString + ' ' + data[count].hash + ': ' + data[count].message;
				messages.appendChild(message);
				console.log('CLIENT DEBUG: message:' + data[count].message);
			}
		}
		shouldScroll = messagesContainer.scrollTop + messagesContainer.clientHeight === messagesContainer.scrollHeight;
		
		if (!shouldScroll) {
			scrollToBottom();
		}
	});
	clear.addEventListener('click', function() {
		socket.emit('clear');
	});
	
	socket.on('cleared', function() {
		messages.innerHTML = '';
	});
	
});

function scrollToBottom() {
	messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

scrollToBottom();