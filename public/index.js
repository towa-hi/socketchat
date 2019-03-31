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
				//var flagString = '<img src="http://127.0.0.1:8080/' + data[count].state.toLowerCase() + '.png">'
				//var flagString = data[count].state + ' ' + data[count].country;
				var flagString = '<img style="vertical-align:middle" src="https://kohlchan.net/static/flags/unknown.png">';
				// if (data[count].country == 'US') {
					// flagString = '<img style="vertical-align:middle; border:1px solid" src="http://18.218.147.148:8080/states/' + data[count].state.toLowerCase() + '.png">';
				// } else if (data[count].country != null){
					// flagString = '<img style="vertical-align:middle; border:1px solid" src="https://kohlchan.net/static/flags/' + data[count].country.toLowerCase() + '.png">';
				// }
				if (data[count].country != null){
					flagString = '<img style="vertical-align:middle" src="https://kohlchan.net/static/flags/' + data[count].country.toLowerCase() + '.png">';
				}
				var hashString = data[count].hash.substring(0,5);
				message.setAttribute('class', 'chat-message');
				message.innerHTML = timeString + ' ' + flagString + ' ' + hashString + ': ' + data[count].message;
				messages.appendChild(message);
				console.log('CLIENT DEBUG: message:' + data[count].message);
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
	
	socket.on('cleared', function() {
		messages.innerHTML = '';
	});
	
});

function scrollToBottom() {
	messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

scrollToBottom();