let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;

let port = process.env.PORT;
let sockets = [];
const uri = "mongodb+srv://db_user:esesrere123@cluster0-i4qnu.gcp.mongodb.net/test?retryWrites=true&w=majority";
let db;
let db_ok = false;

const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(function (err) {
    db = client.db('test_db');
    db_ok = true;
});

function get_text(func) {
    if (db_ok) {
        db.collection('test_col').find({}).toArray(function (err, result) {
            let text = result[0].db_text;
            func(text);
        });
    }
}

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/css', function (req, res) {
    res.sendFile(__dirname + '/src/css/style.css');
});

app.get('/logic', function (req, res) {
    res.sendFile(__dirname + '/src/js/logic.js');
});

if (port == null || port == "") {
    port = 80;
}

http.listen(port);

function show(text) {
    sockets.forEach(function (thisSocket) {
        thisSocket.emit('show_messages', { messages: text });
    });
}

io.on('connection', function (socket) {
    sockets.push(socket);

    get_text(function (text) {
        show(text);

        socket.on('new_message', function (data) {
            get_text(function (the_text) {
                let date = new Date();
                let new_message_html = '<div class="message"><p class="date">' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() +'</p>' + '<p class="time">' + date.getHours() + ':' + date.getMinutes() + '</p><p class="text">' + data.message + '</p></div>';

                let myquery = { db_text: the_text };
                let newvalues = { $set: { db_text: new_message_html + the_text} };
                db.collection('test_col').updateOne(myquery, newvalues, function () {
                    get_text(function (new_text) {
                        show(new_text);
                    });
                });
            });
        });
    });
});

setInterval(function () {
    sockets = [];
}, 1000 * 60 * 30 * 1);