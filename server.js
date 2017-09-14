var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var player = {};
var black = [], white = [];
var isBlack = true, isOver = false;

app.get('/', function(req, res){
	res.sendFile(__dirname+'/index.html');
})

io.on('connection', function(socket){
	console.log('connect succees !')
	socket.on('submit', function(msg){
		io.emit('submit',msg)
	});
    socket.on('move', function (xy) {
        if (isOver) return false;
        if(xy.p != (isBlack ? player.black : player.white)) {
            return false
        }
        var num = getXY(xy.x, xy.y);
        if (black.indexOf(num) > -1 || white.indexOf(num) > -1) {
            return false
        }
        if (isBlack) {
            black.push(num)
        } else {
            white.push(num)
        }
        xy.isBlack = isBlack;
        io.emit('move', xy);
        checkLine(xy.x, xy.y);
        isBlack = !isBlack;
    });
    socket.on('join', function (name) {
        var fang = '旁观者';
        if (name != '') {
            if (!player.black || player.black==name) {
                player.black = name;
                fang = '黑方'
            } else if (!player.white || player.white==name) {
                player.white= name;
                fang = '白方'
            }
        }
        io.emit('join', {
            name: name,
            fang: fang,
            black: black,
            white: white,
            isBlack: isBlack
        })
    });
    socket.on('logout', function (name) {
        if (player.black == name){
            player.black = null
            reset();
        } else if (player.white == name) {
            player.white = null
            reset();
        }
    });
});
// 检查是否获胜
// 像这种四条轴线的，不循环也没问题，把中间的算法抽出来写成一个函数，调用四次就好了
function checkLine(x, y) {
    var i = 1, s = 0;
    var arr = isBlack ? black : white;
    var xo = [[1,0], [1,1], [0,1], [1,-1]];
    for (var o = 0; o < 4; o++) {
        for (var r = 1,s = 0; r >= -1; r -= 2, i = 1) {
            while (arr.indexOf(getXY(x + xo[o][0]*r*i*50, y + xo[o][1]*r*i*50)) > -1) {
                i++;
                s++;
                if (s >= 4) {
                    isOver = true;
                    io.emit('win', ~~!isBlack);
                    reset();
                    return false;
                }
            }
        }
    }
}
function getXY(x, y) {
    if (x < 0 || y < 0) {
        return -1;
    }
    return (y-y%50)*50 + x-x%50;
}
function reset() {
    player = {};
    black = [], white = [];
    isBlack = true, isOver = false;
}

http.listen(3000, function(){
	console.log('listening on port 3000')
});