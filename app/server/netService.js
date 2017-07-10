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

module.exports = {
    testRemoteNode:  testRemoteNode
}