var config = require('../../config.json');

var sprintf = require('sprintf').sprintf;

var wss
var ws 
var req

var testRunning  
var testMoreMessages 
var testMessagesSent 
var testMessagesTotal
var testDelayBetween 


var testStatus = function () {
	return new Promise((resolve,reject)=>{
        const ip = this.req.connection.remoteAddress
        if (typeof testRunning == "undefined") {
        	testRunning = false
        	testMessagesSent = 0
        	testMessagesTotal = 0
        }
		var res = {
			action: 'test-status',
			action2: 'test-status',
			testRunning: testRunning,
			testMoreMessages: testMoreMessages,
			testMessagesSent: testMessagesSent,
			testMessagesTotal: testMessagesTotal,
			testDelayBetween: testDelayBetween
		}

        this.ws.send( JSON.stringify(res) , function ack(err) {
            if (err) {
                console.error(err)
            }
        });

		resolve(this.testRunning)
        sendTestStatusBroadcast()
	})
}

var sendTestStatusBroadcast = function() {
		var res = {
			action: 'test-status',
			broadcast: 'test-status',
			testRunning: testRunning,
			testMoreMessages: testMoreMessages,
			testMessagesSent: testMessagesSent,
			testMessagesTotal: testMessagesTotal,
			testDelayBetween: testDelayBetween
		}

		if (typeof thisWss == "object" && typeof thisWss.clients != "undefined") {
		
        thisWss.clients.forEach(function each(client) {
            if (client.readyState === 1) {
                client.send(JSON.stringify({}), function ack(err) {
                	if (err) {console.err(err)}
                });
            }
        });
		}

		
		thisWs.send( JSON.stringify(res) , function ack(err) {
            if (err) {
                console.error(err)
            }
        });
        
}

var iterate = function() {
	testMessagesSent ++
    console.log(testMessagesSent, thisWs.protocolVersion)

	if (testMessagesSent == testMessagesTotal) {
       	testRunning = false
	}
    sendTestStatusBroadcast()

	if (testMessagesSent < testMessagesTotal) {
		setTimeout(iterate, testDelayBetween)
	}
}

var testStart = function (stressTotal, stressBetween) {
	testRunning = true
	testMoreMessages = true
	testMessagesSent = 0
	testMessagesTotal = stressTotal
	testDelayBetween = stressBetween

    if (testDelayBetween <= 0 ) {testDelayBetween = 0}

	return new Promise((resolve,reject)=>{
        const ip = this.req.connection.remoteAddress

		resolve(this.testRunning)
        thisWs = this.ws
        //thisWss = this.wss
        this.sendTestStatusBroadcast()

		process.nextTick(iterate)
	})
}

var setWss = function (w) {
	wss = w
	thisWss = w
}

module.exports = {
	setWss : setWss,
    testStatus:  testStatus,
    testStart:   testStart,
    sendTestStatusBroadcast: sendTestStatusBroadcast
}