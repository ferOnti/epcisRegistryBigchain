var sprintf   = require('sprintf').sprintf;
var crypto    = require("crypto");
var cryptoConfigService = require("./cryptoConfigService");


const algorithm = 'aes-256-ctr';
const password  = 'd77c0d46ae188164391f67b5d8eb3883';

function encrypt(text, input, output) {
	if (!input ) {
		input = 'utf8'
	}
	if (!output ) {
		output = 'hex'
	}
    var cipher  = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, input, output)
    crypted += cipher.final(output);
    return crypted;
}

function decrypt(text, input, output){
	if (!input ) {
		input = 'utf8'
	}
	if (!output ) {
		output = 'hex'
	}
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, input, output)
    dec += decipher.final(output);
    return dec;
}

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

var getPublicConfig = function() {
	return new Promise((resolve, reject) => {
		resolve(cryptoConfigService.getPublicConfig())
	})
}
var getNodeInfo = function() {
	return new Promise((resolve, reject) => {
		config = cryptoConfigService.getPublicConfig()
		data = {
			name: config.name,
			host: config.host,
			port: config.port,
			publicKey:config.publicKey
		}
        
    	plainJson = JSON.stringify(data)
    	encodedJson = encrypt(plainJson, 'utf8', 'base64')
		resolve(encodedJson)
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

var postParticipantSignature = function (signature) {
	return new Promise((resolve, reject) => {
		if (signature=="") {
			reject("signature could not be empty string")
		}

    	encodedJson = decrypt(signature, 'base64', 'utf8')
    	console.log(encodedJson)
        try {
    	    plainJson = JSON.parse(encodedJson);
    	} catch(e) {
			reject("error parsing signature " + e)
			return
    	}
    	console.log("after parse")
    	var name = plainJson.name
    	console.log(name)

		participants = cryptoConfigService.getParticipants()
		var found = null
		for (i in participants) {
			if (participants[i].name == name) {
				found = i
			}
		}

		if (found != null) {
			reject("already exists participant with id '"+ name +"'")
		} else {
			participants.push( {
				id: participants.length,
				name: plainJson.name,
				host: plainJson.host,
				port: plainJson.port,
				publickey: plainJson.publicKey  //todo: use upper-case
			})
			cryptoConfigService.setParticipants(participants)
			cryptoConfigService.writeConfig()
	   		resolve(cryptoConfigService.getParticipants())
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
	getPublicConfig: getPublicConfig,
	getNodeInfo:     getNodeInfo,
    getPublicKey:    getPublicKey,
    getChannels:     getChannels,
    getChannel:      todo,
    postChannel:     todo,
    deleteChannel:   todo,
    postRenameNode:  postRenameNode,
    getParticipants: getParticipants,
    getParticipant:  getParticipant,
    postParticipant: postParticipant,
    deleteParticipant: deleteParticipant,
    postSignature:   postParticipantSignature
}



