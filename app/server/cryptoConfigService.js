var crypto   = require("crypto");
var fs       = require('fs');
var base58 = require('bs58')
var Ed25519Keypair = require('./Ed25519Keypair')

//global and exported variables
var config    = null  //the whole config file content
var serverKey = null  //the server key, public and private, ready to be used
var channels  = null  //channels array
const cryptoConfigFile = rootpath + '/crypto.config'

const emptyCrytoConfig = {
	name: "vizixBigchain",
	host: "localhost",
	port: 3000,
	publicKey:null, 
	privateKey: null, 
	participants: [],
	channels:[]
}

var createConfigFile = function(cryptoConfigFile) {
	const key = new Ed25519Keypair()
	config = emptyCrytoConfig

	config.publicKey  = key.publicKey
	config.privateKey = key.privateKey

	writeConfig()
    return config
}

var readConfigFile = function(cryptoConfigFile) {
	var data = fs.readFileSync(cryptoConfigFile, 'utf8')
	var config = JSON.parse(data)
	return config
}

var init = function () {
	return new Promise((resolve, reject) => {
    	if (!fs.existsSync(cryptoConfigFile)) {
    		createConfigFile(cryptoConfigFile)
	    }

	    //always read the config file
    	config = readConfigFile(cryptoConfigFile)

    	if (config.privateKey.length != 44) {
    		return reject("invalid private key")
    	}
    	if (config.publicKey.length != 44) {
    		return reject("invalid public key ")
    	}
    	resolve(true)
	})	
}

var writeConfig = function() {
   	var cryptoConfigFile = rootpath + '/crypto.config'
   	console.log(cryptoConfigFile)
	if (config == null) {
		console.error("Error, config is empty")
		return null
	}
	//saving
	var json = JSON.stringify(config, null, 4)
    fs.writeFileSync(cryptoConfigFile, json)
    return config
}

var getPublicConfig = function() {
   	config = readConfigFile(cryptoConfigFile)
	if (config == null) {
		console.error("Error, config is empty")
		return null
	}
	result = {
		name: config.name,
		host: config.host,
		port: config.port,
		publicKey: config.publicKey, 
		channels:  config.channels,
		participants: config.participants
	}
	return result
}

var getKey = function() {
	if (config == null) {
		console.error("Error, config is empty")
		return null
	}
	const key = new Ed25519Keypair()
	key.publicKey  = config.publicKey
	key.privateKey = config.privateKey

   	return resultKey
}

var getChannels = function() {
   	config = readConfigFile(cryptoConfigFile)
	if (config == null) {
		console.error("Error, config is empty")
		return null
	}
	return config.channels
}

var setChannels = function(channels) {
   	config = readConfigFile(cryptoConfigFile)
	if (config == null) {
		console.error("Error, config is empty")
		return null
	}
	config.channels = channels
}


var renameNode = function (name, host, port) {
	if (config == null) {
		console.error("Error, config is empty")
		return null
	}
	config.name = name
	config.host = host 
	config.port = port

	writeConfig()
    return config
}

var getParticipants = function() {
   	config = readConfigFile(cryptoConfigFile)
	if (config == null) {
		console.error("Error, config is empty")
		return null
	}
	return config.participants
}

var setParticipants = function(participants) {
	if (config == null) {
		console.error("Error, config is empty")
		return null
	}
	config.participants = participants
}

module.exports = {
	serverKey       : serverKey,
	channels        : channels,
	init            : init,
	getPublicConfig : getPublicConfig,
	writeConfig     : writeConfig,
	getKey          : getKey,
	getChannels     : getChannels,
	setChannels     : setChannels,
	renameNode      : renameNode,
	getParticipants : getParticipants,
	setParticipants : setParticipants
}


