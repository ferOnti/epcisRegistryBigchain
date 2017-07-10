var config = require('../../config.json');

var request = require('sync-request');
var sprintf = require('sprintf').sprintf;
var http = require('http');


// Global variables
var testRemoteNode = function (node, publicKey) {
	return new Promise((resolve,reject)=>{

		//todo sanitize, and check node/url
		url = "http://" + node+ "/crypto/config"

		http.get(url, function(response) {
		    var finalData = "";

			response.on("data", function (data) {
		    	finalData += data.toString();
		  	});

		  	response.on("end", function() {
		    	//console.log(finalData.toString());
		        try {
    			    dataJson = JSON.parse(finalData);
    			} catch(e) {
					reject("error parsing response " + e)
					return
    			}
    			if (dataJson.publicKey == publicKey) {
					resolve({error:false, message: "test remote node was successfully"} )
    			} else {
    				reject("the specified publicKey does not correspond to this node")
    			}
		  	});
		}).on("error", function(error) {
			message = sprintf( "Error: %s %s %s:%s", error.syscall, error.code, error.address, error.port)
		  	reject(message)
		});
	})

}

var postToRemote = function (server, encryptedJson) {
	return new Promise((resolve,reject)=>{
		serverArr = server.split(":")
		host = serverArr[0]
		port = serverArr[1]

		// An object of options to indicate where to post to
		var post_options = {
			host: host,
			port: port,
			path: "/crypto/channel/remote",
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			//	'Content-Length': Buffer.byteLength(post_data)
			}
		};
		
		// Set up the request
		var post_req = http.request(post_options, function(res) {
		    var finalData = "";

			res.setEncoding('utf8');
			res.on('data', function (data) {
		    	finalData += data.toString();
			});
		  	res.on("end", function() {
		    	console.log(finalData.toString());
		    	resolve(finalData)
		        try {
    			    dataJson = JSON.parse(finalData);
    			} catch(e) {
					reject("error parsing response " + e)
					return
    			}
		  	});
		});

		post_req.on("error", function(error) {
			message = sprintf( "Error: %s %s %s:%s", error.syscall, error.code, error.address, error.port)
		  	reject(message)
		});

		// post the data
		post_req.write(JSON.stringify(encryptedJson));
		post_req.end();

	})

}

module.exports = {
    testRemoteNode:  testRemoteNode,
    postToRemote:    postToRemote
}