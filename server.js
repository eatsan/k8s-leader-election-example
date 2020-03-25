var http = require('http');
var os = require( 'os' );

var ifaces = os.networkInterfaces( );

// This will hold info about the current leader
var leader = {};

// This will hold the IP address of the container
var myIpAddress;
var myHostname;

// A callback that is used for our outgoing client requests to the sidecar
var cb = function(response) {
	var data = '';
	response.on('data', function(piece) { data = data + piece; });
	response.on('end', function() { leader = JSON.parse(data); });
};

var getNodeIp = function() {
	Object.keys(ifaces).forEach(function (ifname) {
		var alias = 0;
		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' !== iface.family || iface.internal !== false) {
				// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
				return;
			}
			if (alias >= 1) {
				// this single interface has multiple ipv4 addresses
				// console.log(ifname + ':' + alias, iface.address);
			} else {
				// this interface has only one ipv4 adress
				//console.log(ifname, iface.address);
				// return the first iface.address (ignore the other iface)
				myIpAddress = iface.address;
				return  iface.address;
			}
			++alias;
		});
	});
};

// Make an async request to the sidecar at http://localhost:4040
var updateLeader = function() {
	var req = http.get({host: 'localhost', path: '/', port: 4040}, cb);
	req.on('error', function(e) { console.log('problem with request: ' + e.message); });
	req.end();
};

var handleRequest = function(request, response) {
	// Get the current date object
	let date1 = new Date();

	// Set my hostname
	myHostname = os.hostname();

	//Some logging to the console
	console.log('Received request for URL: ' + request.url);
	//response.writeHead(200);
	response.statusCode = 200; // Send 200 OK
	response.write('<html>');
	response.write('<body>');
	response.write("<h2> My hostname: " + myHostname + "</h2>");
	response.write("<h2> My IP      : "+ myIpAddress  +"</h2>");
	if (myHostname == leader.name) {
		response.write("<h2> I am the current master! </h2>");
	}
	else{
		response.write("<h2> The master is at hostname: "+ leader.name  +"</h2>");
	}

	response.write("<p> Current time: "+ date1.getHours() + ":" + date1.getMinutes() + ":" + date1.getSeconds() + "</p>");
	response.write('</body>');
	response.write('</html>');
	response.end();
};

// Set up regular updates
updateLeader();
setInterval(updateLeader, 3000);
getNodeIp();
setInterval(getNodeIp, 3000);

// Create the server object
var www = http.createServer(handleRequest);
www.listen(8080);


