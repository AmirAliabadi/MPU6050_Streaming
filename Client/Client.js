var dgram = require('dgram');
var server = dgram.createSocket('udp4');

var PORT = 2311;
var HOST = '192.168.0.100';


server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    //console.log(remote.address + ':' + remote.port +' - ' + message);
	console.log(''+message);
});

server.bind(PORT, HOST);