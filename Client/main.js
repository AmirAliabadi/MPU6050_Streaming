var http = require('http'); 	// npm install http
var url = require('url'); 
var fs = require('fs'); 		// npm install fs
var path = require('path');
var net = require('net');
var dgram = require('dgram'); 	// npm install dgram

var ip = require('ip'); // npm install ip -s

var ifft = require('fft-js').ifft
var fft = require('fft-js').fft;

var baseDirectory = path.join(__dirname, "");
var httpPort = 8080;

var UDP_PORT = 2311;
var HOST = ip.address(); 

// This array holds the clients (actually http server response objects) to send data to over SSE
var clients = [];

//  For the static files we server out of the 
var contentTypeByExtension = {
		'.css':  'text/css',
		'.gif':  'image/gif',
		'.html': 'text/html',
		'.jpg':  'image/jpeg',
		'.js':   'text/javascript',
		'.png':  'image/png',
};

// Create an HTTP server
const httpServer = http.createServer(function (request, response) {
	try {
		
		var requestUrl = url.parse(request.url);
			
		// path.normalize prevents using .. to go above the base directory
		var pathname = path.normalize(requestUrl.pathname);
		
		if (pathname == '/data' || pathname == '\\data') {
			
			// Return SSE data
			// http://www.html5rocks.com/en/tutorials/eventsource/basics/
			var headers = {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					'Connection': 'keep-alive'
			};
			response.writeHead(200, headers);
			
			console.log("starting sse");
			clients.push(response);
		}
		else {
			
			if (pathname == '/' || pathname == '\\') {
				pathname = 'index.html';
			}
			 			
			// Handle static file like index.html and main.js			
			// Include an appropriate content type for known files like .html, .js, .css
			var headers = {};
		    var contentType = contentTypeByExtension[path.extname(pathname)];
		    if (contentType) {
		    	headers['Content-Type'] = contentType;
		    }
		    		    
			var fsPath = path.join(baseDirectory, pathname);
	 
			var fileStream = fs.createReadStream(fsPath);
			response.writeHead(200, headers);

			fileStream.pipe(response);

			fileStream.on('error',function(e) {
				response.writeHead(404);
				response.end();
			});
		}
	} catch(e) {
		response.writeHead(500);
		response.end();
		console.log(e.stack);
	}
});

httpServer.listen(httpPort);


////////////////////////////////////////////////////////////////////////////////////
// UDP Data Server
////////////////////////////////////////////////////////////////////////////////////
const dataServer = dgram.createSocket('udp4');

dataServer.on('listening', function () {
    var address = dataServer.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

dataServer.on('message', function (message, remote) {
	//console.log(''+message);
	sendDataToClients(message);
});

dataServer.bind(UDP_PORT); //, HOST);

var arr = [
	[0.0,0.0,0.0],
	[0.0,0.0,0.0],
	[0.0,0.0,0.0],
	[0.0,0.0,0.0],
	[0.0,0.0,0.0],
	[0.0,0.0,0.0],
	[0.0,0.0,0.0],
	[0.0,0.0,0.0],
	[0.0,0.0,0.0],
	[0.0,0.0,0.0],
	[0.0,0.0,0.0],
	[0.0,0.0,0.0],
	[0.0,0.0,0.0],
	[0.0,0.0,0.0],
	[0.0,0.0,0.0]	
	];
	
var arr = [
	0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,
	0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,
	0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,
	0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,
	0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,
	0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,
	0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,
	0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0
	];

// Send data to all SSE web browser clients. data must be a string.
function sendDataToClients(data) {
	var failures = [];
	var json = '';

	data = '' + data;
	
	json += '{"t":' + data.split(" ")[0] + ',';
	json += '"acc":[';
	json +=		data.split(" ")[1] + ',';
	json +=		data.split(" ")[2] + ',';
	json +=		data.split(" ")[3] + '],';
	json += '"gyro":[';	
	json +=		data.split(" ")[4] + ',';
	json +=		data.split(" ")[5] + ',';
	json +=		data.split(" ")[6] + '],',
	json += '"ang":[';
	json +=		data.split(" ")[7] + ',';
	json +=		data.split(" ")[8] + ',';	
	json +=		data.split(" ")[9] + '],';
	json += '"avg_acc":[';
	json +=		data.split(" ")[10] + ',';
	json +=		data.split(" ")[11] + ',';	
	json +=		data.split(" ")[12] + '],';
	json += '"avg_gyro":[';
	json +=		data.split(" ")[13] + ',';
	json +=		data.split(" ")[14] + ',';	
	json +=		data.split(" ")[15] + ']';
	json += '}';		
	
	var jdata = JSON.parse(json);
	
	//arr.shift();
	//arr.push( [jdata.gyro[0],jdata.gyro[1],jdata.gyro[2]] );	
	//arr.push( jdata.gyro[0] );	

	//var phasors = fft(arr);
	//console.log(phasors);	
	
	console.log(json);
	//console.log(arr);
	
	clients.forEach(function (client) {
		if (!client.write('data: ' + json + '\n\n')) {
			failures.push(client);
		}
	});
	
	failures.forEach(function (client) {
		console.log("ending SSE : " + client);
		removeClient(client);
		client.end();
	});
}

// Remove client (actually a HttpServer response object) from the list of active clients 
function removeClient(client) {
	var index = clients.indexOf(client);
	if (index >= 0) {
		clients.splice(index, 1);
	}
}

console.log('WebUI is Here: http://' + HOST + ':' + httpPort );