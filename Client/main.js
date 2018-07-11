var http = require('http'); 	// npm install http
var url = require('url'); 
var fs = require('fs'); 		// npm install fs
var path = require('path');
var net = require('net');
var dgram = require('dgram'); 	// npm install dgram

var keypress = require('keypress');
 
// make `process.stdin` begin emitting "keypress" events
//keypress(process.stdin);

var ip = require('ip'); // npm install ip -s

var ifft = require('fft-js').ifft
var fft = require('fft-js').fft;

var dtw_dtw = require('dtw');
var dtw_xxx = new dtw_dtw();

var baseDirectory = path.join(__dirname, "");
var httpPort = 8080;

var UDP_PORT = 2311;
var HOST = ip.address();

//var min_score = 99999999.00;

/////////////////////////////////////////////
// SERIAL PORT METHOD
var SerialPort = require('serialport');
const parsers = SerialPort.parsers;

const parser = new parsers.Readline({
  delimiter: '\r\n'
});

var port = new SerialPort('COM7', {
  baudRate: 115200
});

port.pipe(parser);
port.on('open', () => console.log('Port open'));
parser.on('data', (d) => sendDataToClients(d));
//parser.on('data', console.log); // sendDataToClients
/////////////////////////////////////////////

//////////////
// KEY PRESS
// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);
 
// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  console.log('got "keypress"', key);
  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
  }
});
//process.stdin.setRawMode(true);
//process.stdin.resume();
/////////////

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
	//sendDataToClients(message);
});

dataServer.bind(UDP_PORT); //, HOST);
/*
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
*/
var arr = [];
	
var right_right = [
		[-0.4,-0.4,-0.6,-0.4,-0.6,-0.6,-0.5,-0.7,-0.9,-1,-1.4,-2.3,-4.2,-6.1,-5.8,-6.3,-3,-2.8,-2.8,-2.3,8.4,38.2,83.5,125.6,138.8,145,161.6,207.8,250.1,250.1,250.1,250.1,250.1,250.1,250.1,250.1,148,115.5,125.9,143,133.6,81.7,12.8,-52.3,-103.5,-154.6,-200.7,-245.6,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-229.9,-191.2,-192,-203.6,-205,-182.1,-145.6,-114.6,-85.1,-57.4,-35.7,4.2,100.7,250.1,250.1,250.1,250.1,250.1,250.1,250.1,250.1,250.1,250.1,250.1,225,178.7,128.6,62.7,-5.3,-56.3,-109.6,-167.9,-241.6,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-186.2,-131.1,-97.7,-78.8,-61.7,-41.7,-16.7,0.3,6.1,4.5,3.2,2.9],
		[-0.5,-0.6,-0.6,-0.7,-0.7,-0.5,-0.1,2.5,3.9,2.6,-4.2,-21.3,-29.2,-35.1,-37,-40.1,-40.8,-40.4,-39.6,-39.7,-40.2,-35.3,-29,-19.5,-10.9,0.7,16.4,36.5,57.9,92.1,142.4,200.2,250.1,250.1,250.1,250.1,250.1,250.1,250.1,250.1,250.1,250.1,189.2,139.6,117,111.1,111.5,110.7,93.1,59.7,-5.8,-101.1,-209.6,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-186.5,-73.4,58.6,225.7,250.1,250.1,250.1,250.1,250.1,250.1,250.1,250.1,141.4,52,-13.9,-66.5,-131.6,-207.6,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-177,-111,-49.1,-4,22.8,35.3,41.7,45.6,49.1,19.2,21.6,22.6,-1.1,-7.8,-9.7,-8.9,-7.6,-7.4,-12,-12.8,-16.4,-17.3,-11.4,-8,-5.5,-3.8,-2.7,-2,-1.5,-1.2,-1,-0.9,-0.8,-0.7,-0.7,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.5,-0.6,-0.6,-0.6,-0.6,-0.6],
		[-1.2,-0.3,-0.2,-0.7,-3.5,-5.5,-5.2,-5.8,-6.9,-8.5,-9.4,-10,-8.7,-5.6,-3.5,-2.9,-3.2,-5.1,-8.9,-10,-8.3,-5.9,-4,-6.7,-10.8,-13.4,-14.3,-15.8,-17.2,-20.7,-25.3,-25.8,-25.8,-23.6,-21.2,-24.5,-25.9,-22.2,-14.8,-6.9,-0.6,5.4,16,47.4,121.1,249.4,250.1,250.1,250.1,250.1,250.1,250.1,250.1,250.1,141.4,18,-108.7,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-235.9,-212.3,-185.1,-153.2,-130.9,-114.5,-97.3,-81.8,-64.3,-40.6,-9.3,26.5,95.6,250.1,250.1,250.1,250.1,250.1,250.1,250.1,250.1,250.1,50.2,-151.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-250.1,-135,-35.9,37.3,77.8,81.9,74,78.1,82.8,79.1,69.7,50.1,26.8,14.8,10.7,11.4,10.1,4.7,2.3,-0.6,0.6,3.6,2,5.6,9.4,10.5,13.2,14,10,8.8,7.5,8.4,15.4,20.4,18.5,17.1,17.7,18.2,21.3,19.6,9.5,1.2,-4.5,-7.2],
		[-0.41,-0.42,-0.42,-0.41,-0.4,-0.39,-0.39,-0.43,-0.44,-0.45,-0.48,-0.51,-0.56,-0.69,-0.72,-0.59,-0.34,-0.15,-0.18,-0.49,-0.32,1.64,6.23,41.22,76.24,189.92,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,221.33,145.43,122.67,86.76,71.35,46.73,21.53,6.89,-32.44,-57.56,-104.24,-118.41,-143.97,-176.36,-192.68,-232.36,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-235.8,-193.47,-122.89,-93.75,-52.11,-25.66,-15.89,-1.76,0.45,-0.11,0.57,5.22,13.72,16.61,13.57,11,8.81,8.14,4.89,5.16,4.98,4.05,3.37,3.28,4.34,5.78,11.04,16.19,37.57,66.89,150.15,197.97,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,247.28,189.82,169.64,135.05,119.32,96.37,81.53,75.77,63.64,54,29.72,18.18,-1.01,-19.05,-28.26,-48,-57.82,-79.86,-95.44,-117.3,-161.34,-185.45,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-177.78,-138.73,-84.5,-66.01,-40.07,-30.99,-18.81,-11.39,-8.86,-5.34,-4.15,-2.53,-1.94,-1.21,-1.01,-0.7,-0.56,-0.53,-0.47,-0.46,-0.47,-0.47,-0.37,-0.4,-0.34,-0.34,-0.32,-0.21,-0.2,-0.35,-0.39,-0.4,-0.44,-0.44,-0.53,-0.44,-0.31,-0.43,-0.47],
		[-0.46,-0.43,-0.45,-0.45,-0.44,-0.44,-0.45,-0.47,-0.47,-0.41,-0.37,-0.3,-0.25,-0.13,-0.1,0.05,0.15,0.16,-0.2,-0.03,8.65,35.79,148.09,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,123.69,66.42,-41.56,-104.48,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-242.55,-206.4,-136.6,-110.27,-85.67,-76.53,-72.18,-61.93,-54.66,-35.2,-16.21,-8.68,12.5,29.22,67.66,89.05,143.16,224.34,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,139.21,69.3,-78.88,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-163.34,-130.53,-86.52,-66.91,-59.13,-44.8,-42.56,-41.32,-38.12,-26.6,-20.62,-22.21,-50.26,-85.15,-104.28,-102.08,-90.17,-85.01,-76.96,-71.69,-68.76,-49.27,-37.57,-25.44,-19.42,-11.98,-7.75,-6.11,-4.18,-3.37,-2.01,-1.32,-0.47,0.05,0.24,-0.23,-0.45,-0.56,-0.66],
		[-0.5,-0.5,-0.45,-0.46,-0.45,-0.47,-0.49,-0.47,-0.45,-0.41,-0.42,-0.43,-0.44,-0.45,-0.63,-0.77,0.42,2.47,3.47,3.45,6.41,50.38,92.63,192.02,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,204.82,161.53,80.67,37.09,-63.25,-177.6,-232.6,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-204.33,-159.87,-99.66,-75.17,-37,-23.07,4.58,34.55,50.66,82.74,100.54,145.15,176.2,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,250.13,149.1,93.15,-16.32,-97.47,-124.82,-159.44,-174.79,-235.39,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-250.14,-192.97,-147.34,-84.77,-64.85,-46.99,-47.61,-54.6,-63.62,-66.73,-67.98,-64.9,-53.34,-45.29,-39.13,-148.5,-162.82,-98.56,-81.31,-52.7,-41.79,-25.5,-15.66,-12.37,-7.79,-6.2,-3.85,-3.08,-2.09,-1.5,-1.29]
	] ;
	
// Send data to all SSE web browser clients. data must be a string.
function sendDataToClients(data) {
	var failures = [];
	var json = '';

	var upd_data = '' + data;

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
	json +=		data.split(" ")[9] + ']';
	json += '}';		
	
	//console.log( json );
	var jdata = JSON.parse(json);
	
	//console.log( jdata.gyro[2] );

	arr.push( jdata.gyro[0] );	
	
	if( arr.length > 300 ) { 
		arr.shift();
	}	

	for( var v in right_right ) {
		var dtw_score = dtw_xxx.compute( arr.slice(0,right_right[v].length), right_right[v]) ;
		//console.log( v + ' : ' + arr.length + ' : ' + jdata.gyro[0] + ' : ' + dtw_score );
		if( dtw_score < 50000.0 ) {
			console.log( '---> ' + v + ' : ' + dtw_score ); // + v + ' : ' + jdata.gryo[0] + ' : ' + dtw_score );
		}
	}	
	
	//if( foo < min_score ) {
	//	min_score = foo;
	//}
	//console.log( min_score );
	//console.log( dtw_xxx.path() );
	//console.log(right_right[0] + ' : ' + arr[0] + ' : ' + jdata.gyro[0] + ' : ' + dtw_xxx.compute(right_right,arr) + ' : ' + min_score );

	/*
	var phasors_1 = fft(right_right);
	var phasors_2 = fft(arr);

	console.log("**************");
	console.log(phasors_1);	
	console.log(phasors_2);	
	console.log("**************");	
	*/
	
	//console.log(json);
	
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