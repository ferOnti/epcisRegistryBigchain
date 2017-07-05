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

var getParticipant = function (id) {
	participants = cryptoConfigService.getParticipants()
	var found = null
	//first search by id
	for (i in participants) {
		//console.log(participants[i].name, name)
		if (participants[i].id == id) {
			found = i
		}
	}
	//if not found, search by name
	if (found == null) {
		for (i in participants) {
			if (participants[i].name == id) {
				found = i
			}
		}
	}
	return new Promise((resolve, reject) => {
		if (found == null) {
			reject("participant with this id, does not exist")
		} else {
			resolve(participants[found])
		}
	})	
}

var postParticipant = function (name, host, port, publickey) {
	//provide any validation over the name, host and port
	//for the moment, just pass to cryptoConfig Service
	participants = cryptoConfigService.getParticipants()
	return new Promise((resolve, reject) => {
		if (publickey.length!=130) {
			return reject("publickey must be 130 hex caracters")
		}

		for (i in participants) {
			//console.log(participants[i].name, name)
			if (participants[i].name == name) {
				return reject("the server name already exist in this node")
			}
		}
		
		participants.push( {
			id: participants.length,
			name: name,
			host: host,
			port: port,
			publickey
		})
		cryptoConfigService.setParticipants(participants)
		cryptoConfigService.writeConfig()
	   	resolve(cryptoConfigService.getParticipants())
	})	
}

var deleteParticipant = function (id) {
	participants = cryptoConfigService.getParticipants()
	var found = null
	//only search by id
	for (i in participants) {
		//console.log(participants[i].name, name)
		if (participants[i].id == id) {
			found = i
		}
	}
	return new Promise((resolve, reject) => {
		if (found == null) {
			reject("participant with this id, does not exist")
		} else {
			resolve(participants)
		}
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
    getParticipant:  getParticipant,
    postParticipant: postParticipant,
    deleteParticipant: deleteParticipant
}



