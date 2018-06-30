var SerialPort = require('serialport');
const parsers = SerialPort.parsers;

const parser = new parsers.Readline({
  delimiter: '\r\n'
});

var port = new SerialPort('COM8', {
  baudRate: 115200
});

port.pipe(parser);
port.on('open', () => console.log('Port open'));
parser.on('data', (foo) => sendDataToClients(foo));

function sendDataToClients(data) {
		console.log(data);
}
