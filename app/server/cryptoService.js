var sprintf   = require('sprintf').sprintf;
var crypto    = require("crypto");
var cryptoConfigService = require("./cryptoConfigService");
//var Ed25519Keypair = require('./Ed25519Keypair')


const algorithm = 'aes-256-ctr';
const password  = 'd77c0d46ae188164391f67b5d8eb3883';

//todo: use only nacl
var	nacl = require("tweetnacl")
	nacl.util = require('tweetnacl-util')
var	bs58 = require('bs58');

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

var getKeyPair = function () {
	return cryptoConfigService.getKeyPair()
}

var getPublicKey = function () {
	return Promise.resolve(cryptoConfigService.getKey().publicKey)
	//return new Promise((resolve, reject) => {
	//	key = cryptoConfigService.getKey()
	//   	resolve(key.publicKey)
	//})	
}

var getPrivateKey = function () {
	return Promise.resolve(cryptoConfigService.getKey().privateKey)
	//return new Promise((resolve, reject) => {
	//	key = cryptoConfigService.getKey()
	//   	resolve(key.getPrivateKey('hex'))
	//})	
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

var deleteParticipant = function (id) {
	participants = cryptoConfigService.getParticipants()
	var found = null
	//first search by id
	for (i in participants) {
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
			var parties = []
			for (i in participants) {
				if (i != found) {
					parties.push(participants[i])
				}
			}
			cryptoConfigService.setParticipants(parties)
			cryptoConfigService.writeConfig()

			resolve( {error:false, message: "participant removed"})
		}
	})	
}

var postParticipantSignature = function (signature) {
	return new Promise((resolve, reject) => {
		if (signature=="") {
			reject("signature could not be empty string")
		}

    	encodedJson = decrypt(signature, 'base64', 'utf8')
    	//console.log(encodedJson)
        try {
    	    plainJson = JSON.parse(encodedJson);
    	} catch(e) {
			reject("error parsing signature " + e)
			return
    	}
    	var name = plainJson.name

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
				publicKey: plainJson.publicKey  
			})
			cryptoConfigService.setParticipants(participants)
			cryptoConfigService.writeConfig()
	   		resolve(cryptoConfigService.getParticipants())
		}
	})	
}

var postParticipant = function (name, host, port, publicKey) {
	//provide any validation over the name, host and port
	//for the moment, just pass to cryptoConfig Service
	participants = cryptoConfigService.getParticipants()
	return new Promise((resolve, reject) => {
		if (publickey.length!=130) {
			return reject("publickey must be 130 hex caracters")
		}

		for (i in participants) {
			if (participants[i].name == name) {
				return reject("A participant with the specified name already exists in this node")
			}
		}
		
		participants.push( {
			name: name,
			host: host,
			port: port,
			publicKey:publicKey
		})
		cryptoConfigService.setParticipants(participants)
		cryptoConfigService.writeConfig()
	   	resolve(cryptoConfigService.getParticipants())
	})	
}

var getEmptyChannel = function(name) {

	var config = cryptoConfigService.getPublicConfig()

	//the channel key used for each participant to 
	//create and transfer assets in the channel
	const channelKey = new cryptoConfigService.compatBdbKeyPair()

    //the channel hash is based in a plain text with random data
    const salt = bs58.encode(nacl.randomBytes(8))
    const plainChannelHash = "channel : " + name + salt
	const channelHash = bs58.encode(nacl.hash(nacl.util.decodeUTF8(plainChannelHash)))

	//the first participant is this server
	//const firstPartyKey =  new cryptoConfigService.compatBdbKeyPair()
	const firstPartyKey = cryptoConfigService.getKeyPair()

	var firstParticipant = {
		name: config.name,
		server: config.host+":"+config.port,
		publicKey: firstPartyKey.publicKey,
		secretKey: firstPartyKey.secretKey
	}

	var channel = {
		name: name,
		publicKey: channelKey.publicKey,
		secretKey: channelKey.secretKey,
		sharedHash: channelHash,
		sharedSecret: "sharedSecret",
		participants: [firstParticipant]
	}
	return channel
}

var cloneChannel = function (original) {
	var channel = {
		name: original.name,
		publicKey: original.publicKey,
		secretKey: original.secretKey,
		sharedHash: original.sharedHash,
		sharedSecret: original.sharedSecret,
		participants: []
	}
	for (i in original.participants) {
		//if (typeof original.participants[i].secretKey == "undefined") {
		var party = {}
		party.name      = original.participants[i].name
		party.server    = original.participants[i].server
		party.publicKey = original.participants[i].publicKey
		channel.participants.push(party)
	}

	return channel
}

var postChannel = function (name, participants) {
	return new Promise((resolve, reject) => {
		if (typeof name == "undefined" || name=="") {
			reject("channel name could not be empty string")
			return
		}

		if (participants=="" || typeof participants == "undefined") {
			reject("channel participants could not be empty list")
			return
		}
		if (participants.constructor !== Array || participants.length == 0) {
			reject("channel participants could not be empty list")
		}

		var allChannels = cryptoConfigService.getChannels()
		for (i in allChannels) {
			if (allChannels[i].name == name) {
				return reject("A channel with the specified name already exists in this node")
			}
		}

		//build the channel object to be added to the list of channels
		var channel = getEmptyChannel(name)

		//build in an array the info for each participant
		allParticipants = cryptoConfigService.getParticipants()

		for (i in participants) {
			for (j in allParticipants) {
				if (participants[i] == allParticipants[j].name) {
					channel.participants.push({
						name: participants[i],
						server: allParticipants[j].host+":"+allParticipants[j].port,
						publicKey: allParticipants[j].publicKey
					})
				}
			}
		}

		//todo: second iteration, 
		//todo: calculate the sharedHash encoded for each participant with his publickey

		//clone the channel object before encrypt and send it
		var clonedChannel = cloneChannel(channel)

		//the clonedChannel is the message to be encrypted with all and each party's publicKey
		var stringify = require('json-stable-stringify');
		var message = nacl.util.decodeUTF8( stringify(clonedChannel) )

		//get participant with the secretKey, the first participant
		var myPublicKey = ""
		var mySecretKey = ""
		var myNodeName  = ""
		for (i in channel.participants) {
			if (typeof channel.participants[i].secretKey == "string") {
				mySecretKey = bs58.decode(channel.participants[i].secretKey)
				myPublicKey = bs58.decode(channel.participants[i].publicKey)
				myNodeName  = channel.participants[i].name
			}
		}

		for (i in channel.participants) {
			if (typeof channel.participants[i].secretKey == "undefined") {

				const theirPublicKey = bs58.decode(channel.participants[i].publicKey)
				const nonce = nacl.randomBytes(24)

				encryptedMessage = nacl.box(message, nonce, theirPublicKey, mySecretKey)

				var encrypted = bs58.encode(encryptedMessage)
		
				var theirSecretKey = bs58.decode("8whQGNn7PbdUbpBxQGwHPYwgNnDnhruM5LMfouCHPbm3")
				var decrypted = nacl.box.open(encryptedMessage, nonce, myPublicKey, theirSecretKey)

				if (decrypted != null) {
					console.log(nacl.util.encodeUTF8(decrypted))
				}			
	
				var netService = require("./netService")
				var encryptedJson = {
					name: channel.name,
					from: myNodeName, 
					publicKey: bs58.encode(myPublicKey), 
					nonce: bs58.encode(nonce),
					message: encrypted
				}
				netService.postToRemote(channel.participants[i].server, encryptedJson)
					.then( console.log )
			}
		}

		//add this channel to the array of all channels
		allChannels.push(channel)

		//and save it in the config file
		cryptoConfigService.setChannels(allChannels)
		cryptoConfigService.writeConfig()

		//third iteration, send the channel to each participant to add it to their config file
		
	   	//resolve(cryptoConfigService.getChannels())
	   	console.log(cryptoConfigService.getChannels())
   		resolve(channel)
	})	
}

var postRemoteChannel = function(name, nonce, publicKey, message) {
	return new Promise((resolve, reject) => {
		if (typeof name == "undefined" || name=="") {
			reject("channel name could not be empty string")
			return
		}

		if (typeof nonce == "undefined" || nonce=="") {
			reject("nonce could not be empty string")
			return
		}

		if (typeof publicKey == "undefined" || publicKey=="") {
			reject("publicKey could not be empty string")
			return
		}

		if (typeof message == "undefined" || message=="") {
			reject("message could not be empty string")
			return
		}

		const thisKey = cryptoConfigService.getKeyPair()

		var box = bs58.decode(message)
		var thisNonce = bs58.decode(nonce)
		var theirPublicKey = bs58.decode(publicKey)

		var secretKey = bs58.decode(thisKey.secretKey)

		var decrypted = nacl.box.open(box, thisNonce, theirPublicKey, secretKey)

		if (decrypted == null) {
			reject("error opening the encrypted message")
		} else {
			decryptedMessage = nacl.util.encodeUTF8(decrypted)
			console.log( decryptedMessage)
			resolve(decryptedMessage)

			try {
				channel = JSON.parse(decryptedMessage)
				
				var allChannels = cryptoConfigService.getChannels()
				allChannels.push(channel)

				//and save it in the config file
				cryptoConfigService.setChannels(allChannels)
				cryptoConfigService.writeConfig()
			} catch(err) {
				reject("encrypted message is invalid")
			}

		}

	})

}
module.exports = {
	init:              init,
	getPublicConfig:   getPublicConfig,
	getNodeInfo:       getNodeInfo,
    getKeyPair:        getKeyPair,
    getPublicKey:      getPublicKey,
    getPrivateKey:     getPrivateKey,
    getChannels:       getChannels,
    getChannel:        todo,
    postChannel:       postChannel,
    postRemoteChannel: postRemoteChannel,
    deleteChannel:     todo,
    postRenameNode:    postRenameNode,
    getParticipants:   getParticipants,
    getParticipant:    getParticipant,
    postParticipant:   postParticipant,
    deleteParticipant: deleteParticipant,
    postSignature:     postParticipantSignature
}



