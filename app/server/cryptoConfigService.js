var crypto   = require("crypto");
var fs       = require('fs');

//todo: use only nacl
var	nacl = require("tweetnacl")
var	bs58 = require('bs58');

//global and exported variables
var config    = null  //the whole config file content
var serverKey = null  //the server key, public and private, ready to be used
var channels  = null  //channels array
const cryptoConfigFile = rootpath + '/crypto.config'

const emptyCrytoConfig = {
	name: "vizixBigchain",
	host: "localhost",
	port: 3000,
	publicKey: null, 
	secretKey: null, 
	participants: [],
	channels:[]
}

//todo: move compatible BigchainDB KeyPair to another files - class level
var compatBdbKeyPair = function() {
	var keyPair = nacl.box.keyPair()
	var publicKey = bs58.encode(keyPair.publicKey);
	var secretKey = bs58.encode(keyPair.secretKey);
	this.keyPair = keyPair
	this.publicKey = publicKey
	this.secretKey = secretKey
}
compatBdbKeyPair.prototype.toString = function dogToString() {
  var ret = 'KeyPair: (' + this.publicKey + ',' + this.secretKey + ')';
  return ret;
}

var createConfigFile = function(cryptoConfigFile) {
	config = emptyCrytoConfig

	var keyPair = new compatBdbKeyPair()
	
	config.publicKey = keyPair.publicKey
	config.secretKey = keyPair.secretKey
	console.log("creating and empty crypto config file")
	writeConfig()
    return config
}

var readConfigFile = function(cryptoConfigFile) {
	var data = fs.readFileSync(cryptoConfigFile, 'utf8')
	var config = JSON.parse(data)
	console.log("  reading crypto config file")
	return config
}

var init = function () {
	return new Promise((resolve, reject) => {
    	if (!fs.existsSync(cryptoConfigFile)) {
    		createConfigFile(cryptoConfigFile)
	    }

	    //always read the config file
    	config = readConfigFile(cryptoConfigFile)

    	if (config.secretKey.length != 44) {
    		console.log(config.secretKey.length)
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

var getKeyPair2 = function() {
	if (config == null) {
		console.error("Error, config is empty")
		return null
	}
	publicKey = bs58.decode(config.secretKey)
	secretKey = bs58.decode(config.secretKey)
	//todo: build the secret key using the 44-strings saved in config file
	keyPair = nacl.sign.keyPair.fromSecretKey(secretKey)

   	return keyPair
}

var getKeyPair = function() {
	if (config == null) {
		console.error("Error, config is empty")
		return null
	}
	keyPair = {
		publicKey: config.publicKey,
		secretKey: config.secretKey
	}

   	return keyPair
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
	compatBdbKeyPair: compatBdbKeyPair,
	serverKey       : serverKey,
	channels        : channels,
	init            : init,
	getPublicConfig : getPublicConfig,
	writeConfig     : writeConfig,
	getKeyPair      : getKeyPair,
	getChannels     : getChannels,
	setChannels     : setChannels,
	renameNode      : renameNode,
	getParticipants : getParticipants,
	setParticipants : setParticipants
}


