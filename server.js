var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var joinlist = {
    black: false,
    white: false
};

app.get('/', function(req, res){
	res.sendFile(__dirname+'/index.html');
})

io.on('connection', function(socket){
	console.log('connect succees !')
	socket.on('submit', function(msg){
		io.emit('submit',msg)
	});
    socket.on('move', function (xy) {
        io.emit('move', xy);
    });
});

http.listen(3000, function(){
	console.log('listening on port 3000')
});