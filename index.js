let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let sockets = [];
let text = '';

let port = process.env.PORT;

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
 
app.get('/css', function(req, res){
    res.sendFile(__dirname + '/src/css/style.css');
});

app.get('/logic', function(req, res){
    res.sendFile(__dirname + '/src/js/logic.js');
});

if (port == null || port == "") {
  port = 80;
}

http.listen(port);

function show() {
    sockets.forEach(function(thisSocket) {
        thisSocket.emit('show_messages', { messages: text });
    });
}

io.on('connection', function(socket){
    sockets.push(socket);

    show();

    socket.on('new_message', function (data) {
        text += data.message;
        show();
    });
});

setInterval(function() {
    sockets = [];
}, 1000 * 60 * 60 * 1);
