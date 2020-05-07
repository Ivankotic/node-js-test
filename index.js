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

    function get_text(func) {
        db.collection('test_col').find({}).toArray(function (err, result) {
            let text = ''; 
            for (let i = 0; i < result.length; i++) {
                text = text + result[i].html;
            }
            func(text);
            console.log(result);
        });

    }

    function show(text) {
        sockets.forEach(function (thisSocket) {
            thisSocket.emit('show_messages', { messages: text });
        });
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

    io.on('connection', function (socket) {
        sockets.push(socket);

        get_text(function (text) {
            show(text);

            socket.on('new_message', function (data) {
                let date = new Date();
                let new_message_html = '<div class="message"><p class="date">' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + '</p>' + '<p class="time">' + date.getHours() + ':' + date.getMinutes() + '</p><p class="text">' + data.message + '</p></div>';

                let message = { html: new_message_html };
                db.collection('test_col').insert(message);
                get_text(function (new_text) {
                    show(new_text);
                });
            });
        });
    });

    setInterval(function () {
        sockets = [];
    }, 1000 * 60 * 30 * 1);

});