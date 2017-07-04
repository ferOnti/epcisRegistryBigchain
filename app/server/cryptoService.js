var sprintf   = require('sprintf').sprintf;
var crypto    = require("crypto");
var cryptoConfigService = require("./cryptoConfigService");


const algorithm = 'aes-256-ctr';
//const password  = 'd77c0d46ae188164391f67b5d8eb3883';


var init = function () {
	return new Promise((resolve, reject) => {
	   	cryptoConfigService.init()
   			.then(() => {
   				//key = cryptoConfigService.getKey()
   				//console.log(key.getPublicKey() )
   				//resolve(key.getPrivateKey())
   				resolve(true)
   			})
	})
}

var todo = function () {
	return new Promise((resolve, reject) => {
		console.log("under construction")
	   	resolve("under construction")
	})	
}


var getPublicKey = function () {
	return new Promise((resolve, reject) => {
		key = cryptoConfigService.getKey()
	   	resolve(key.getPublicKey('hex'))
	})	
}

var getChannels = function () {
	return new Promise((resolve, reject) => {
		channels = cryptoConfigService.getChannels()
	   	resolve(channels)
	})	
}


var postRenameNode = function (name, host, port) {
	//provide any validation over the name, host and port
	//for the moment, just pass to cryptoConfig Service
	return new Promise((resolve, reject) => {
		cryptoConfigService.renameNode(name,host,port)
	   	resolve(true)
	})	
}

var getParticipants = function () {
	participants = cryptoConfigService.getParticipants()
	return new Promise((resolve, reject) => {
		resolve(participants)
	})	
}

var postParticipant = function (name, host, port, publickey) {
	//provide any validation over the name, host and port
	//for the moment, just pass to cryptoConfig Service
	participants = cryptoConfigService.getParticipants()
	participants.push( {
		name: name,
		host: host,
		port: port,
		publickey
	})
	return new Promise((resolve, reject) => {
		cryptoConfigService.setParticipants(participants)
		cryptoConfigService.writeConfig()
	   	resolve(true)
	})	
}


module.exports = {
	init:            init,
    getPublicKey:    getPublicKey,
    getChannels:     getChannels,
    getChannel:      todo,
    postChannel:     todo,
    deleteChannel:   todo,
    postRenameNode:  postRenameNode,
    getParticipants: getParticipants,
    postParticipant: postParticipant
}



