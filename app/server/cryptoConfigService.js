var crypto   = require("crypto");
var fs       = require('fs');

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
	var key = crypto.createECDH('secp256k1')
	var config = emptyCrytoConfig

	key.generateKeys()
	config.publicKey  = key.getPublicKey('hex')
	config.privateKey = key.getPrivateKey('hex')

	writeConfig()
    return config
}

var readConfigFile = function(cryptoConfigFile) {
	var data = fs.readFileSync(cryptoConfigFile, 'utf8')
	var config = JSON.parse(data)
	return config
}

var init = function () {
   	var cryptoConfigFile = rootpath + '/crypto.config'
	return new Promise((resolve, reject) => {
    	if (!fs.existsSync(cryptoConfigFile)) {
    		createConfigFile(cryptoConfigFile)
	    }

	    //always read the config file
    	config = readConfigFile(cryptoConfigFile)
    	//console.log(cryptoConfig.publicKey.length)

    	if (config.privateKey.length != 64) {
    		return reject("invalid private key")
    	}
    	if (config.publicKey.length != 130) {
    		return reject("invalid publicKey key")
    	}
    	resolve(true)
	})	
}

var writeConfig = function() {
	if (config == null) {
		console.error("Error, config is empty")
		return null
	}
	//saving
	var json = JSON.stringify(config, null, 4)
    fs.writeFileSync(cryptoConfigFile, json)
    return config
}

var getKey = function() {
	if (config == null) {
		console.error("Error, config is empty")
		return null
	}
   	var resultKey = crypto.createECDH('secp256k1')
   	resultKey.setPrivateKey(config.privateKey, 'hex')
   	resultKey.setPublicKey (config.publicKey, 'hex')
   	return resultKey
}

var getChannels = function() {
	if (config == null) {
		console.error("Error, config is empty")
		return null
	}
	return config.channels
}

var setChannels = function(channels) {
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
	writeConfig     : writeConfig,
	getKey          : getKey,
	getChannels     : getChannels,
	setChannels     : setChannels,
	renameNode      : renameNode,
	getParticipants : getParticipants,
	setParticipants : setParticipants
}


