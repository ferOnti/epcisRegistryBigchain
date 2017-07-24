'use strict';

var routes = require("./routes.js");
var cryptoService = require("./cryptoService.js")
var mongoService  = require("./mongoService.js")

require('rootpath')();

var config = require(rootpath + '/../config.json');
routes.init(config.app.port, config.app.websocket);

//mongoService.secretTest()

cryptoService.init()
    .then(mongoService.connect)
    .then(() => {
    
    var protobuf = require("protobufjs");
        protobuf.load("protobuf/all.proto", function(err, root) {
        if (err) {
            throw err;
        }
 
        var objectEventMessage = root.lookupType("epcis.ObjectEvent");
 
        var payload = { 
            eventTime: "2017-05-18T04:00:19Z", 
            recordTime: "2017-05-18T04:00:19Z", 
            baseExtension: {eventId: "urn:uuid:0359868b-958a-4433-9623-000000000001"},
            epcList: [
                {epc:"urn:epc:id:sgtin:01544848.02353.0000000001"}, 
                {epc:"urn:epc:id:sgtin:01544848.02353.0000000002"}, 
                {epc:"urn:epc:id:sgtin:01544848.02353.0000000003"}
                ],
            action: 1,
            bizStep: "urn:epcglobal:cbv:bizstep:commissioning",
            disposition: "urn:epcglobal:cbv:disp:active",
            readPoint: [{id:"urn:epc:id:sgln:01234567.3603.02947"}],
            bizLocation: [{id:"urn:epc:id:sgln:01234567.4650.0001"}]
        };

        // Verify the payload if necessary (i.e. when possibly incomplete or invalid) 
        var errMsg = objectEventMessage.verify(payload);
        if (errMsg) {
            throw Error(errMsg);
        }
 
        // Create a new message 
        var message = objectEventMessage.create(payload); // or use .fromObject if conversion is necessary 
        console.log(message)
        console.log()
        // Maybe convert the message back to a plain object 
        var object = objectEventMessage.toObject(message, {
            longs: String,
            enums: String,
            bytes: String,
            defaults: true,
            arrays: true,  
            objects: true,  
            oneofs: true         
        });

        console.log(object)

        // Encode a message to an Buffer (node) 
        var buffer = objectEventMessage.encode(message).finish();
        console.log(buffer.length)
 
        // Decode an Buffer (node) to a message 
        //var message = objectEventMessage.decode(buffer);
 
        console.log("-----------")
    });
    
    
    //    var epcisService  = require("./epcisService.js")
    //    var assetData = {
    //        "id": Math.round(Math.random()*100000),
    //        "epcid": "urn.epcid:gtin:234322.324234",
    //        "bizStep": "urn:cbv:shipping",
    //        "eventDate": new Date()
    //    }        
    //    epcisService.postAsset("channel1", assetData)
    })
    .then (mongoService.getStats )
    /*
    .then(() => {
        
        mongoService.getBlock()
    })
    */
    .catch((message) => {
        //if (typeof message == "object") {
            console.error(message)
        //}
    })

