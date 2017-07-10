'use strict';

var express = require("express");
var app = express();
var router = express.Router();

var routes = require("./routes.js");
var cryptoService = require("./cryptoService.js")
var mongoService  = require("./mongoService.js")

require('rootpath')();

var config = require(rootpath + '/../config.json');
routes.init(express, app, router);

//mongoService.secretTest()

cryptoService.init()
    .then(mongoService.connect)
    //.then(() => {
    //    var epcisService  = require("./epcisService.js")
    //    var assetData = {
    //        "id": Math.round(Math.random()*100000),
    //        "epcid": "urn.epcid:gtin:234322.324234",
    //        "bizStep": "urn:cbv:shipping",
    //        "eventDate": new Date()
    //    }        
    //    epcisService.postAsset("channel1", assetData)
    //})
    .then(() =>{
        app.listen(config.app.port,function() {
            console.log("Live at Port " + config.app.port);
        });
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

