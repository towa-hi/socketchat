//alert("I am an alert box!");

$(function(){
	var socket = io();
	$('form').submit(function(){
		console.log('CLIENT: emitting: ' + $('#m').val());
		socket.emit('input', $('#m').val());
		$('#m').val('');
		return false;
	});
	socket.on('output', function(data) {
		console.log('CLIENT: recieving output...' + data.length);
		if (data.length) {
			for (var count = 0; count < data.length; count++) {
				var message = document.createElement('div');
				var formattedTime = new Date(data[count].time);
				var timeString = formattedTime.toLocaleTimeString('en-US');
				message.setAttribute('class', 'chat-message');
				message.textContent = timeString + ' ' + data[count].userId + ' - ' + data[count].message;
				messages.appendChild(message);
				messages.insertBefore(message, messages.firstChild);
			}
		}
	});
	// socket.on('chat message', function(msg){
		// $('#messages').append($('<li>').text(msg));
		// window.scrollTo(0, document.body.scrollheight);
	// });
	
});