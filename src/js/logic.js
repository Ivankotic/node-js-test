var socket = io();
var messages = document.getElementById("messages");
var message_text = document.getElementById("message_text");
var send_button = document.getElementById("send_button");

socket.on('show_messages', function (data) {
    messages.innerHTML = data.messages;
});

send_button.addEventListener("click", function() {
    socket.emit('new_message', { message: message_text.value });
});