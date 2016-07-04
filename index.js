var consts = {
  robotId: 'XXX',
  accessToken: 'U2FsdGVkX1+7Vk67MGLo4ZWIFGGvPmB0mZkB63K0TTI=',
  host: 'http://localhost:1337',
  serialPort: '/dev/pts/26'
};

var socket = require('socket.io-client')(consts.host),
  request = require('request'),
  SerialPort = require('serialport'),
  querystring = require('querystring');

var port = new SerialPort(consts.serialPort);

var mapId, active;


port.on('open', function() {
  console.log('Serial port opened');
  active = true;
});

port.on('data', function (bufferedData) {
  var data = bufferedData.toString();
  console.log('Received data: ', data);
  postPoint(JSON.parse(data));
});


socket.on('connect', function () {
  console.log('Socket connection opened');
});

socket.on('robots/' + consts.robotId + '/start', function (id) {
  mapId = id;
  if (!active) {
    return console.log('Error: serial port connection is not opened');
  }

  port.write('enable', function (err) {
    if (err) {
      return console.log('Error of port enable: ', err.message);
    }
    console.log('Robot turned on');
  });
});

socket.on('robots/' + consts.robotId + '/stop', function (id) {
  port.write('disable', function (err) {
    if (err) {
      return console.log('Error of port disable: ', err.message);
    }
    console.log('Robot turned off');
  });
});

var postPoint = function (params) {
  request.post({
    headers: {
      'access-token': consts.accessToken
    },
    uri: consts.host + '/users/maps/' + mapId + '/points',
    form: {
      distance: params.d,
      angle: params.g,
      type: params.r
    }
  }, function (err, res, body) {
    console.log(err, body);
  });
};