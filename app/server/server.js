'use strict';

var express = require("express");
var app = express();
var router = express.Router();

var routes = require("./routes.js");
var eris   = require("./eris.js");
var cryptoService = require("./cryptoService.js")
var mongoService  = require("./mongoService.js")

require('rootpath')();

//var config = routes.readConfig();
var config = require(rootpath + '/../config.json');
routes.init(express, app, router);

//mongoService.secretTest()
//process.exit(0)

cryptoService.init()
    .then(mongoService.connect)
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

