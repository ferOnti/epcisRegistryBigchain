var sprintf   = require('sprintf').sprintf;
var crypto    = require("crypto");
var cryptoConfigService = require("./cryptoConfigService");
//var Ed25519Keypair = require('./Ed25519Keypair')


const algorithm = 'aes-256-ctr';
const password  = 'd77c0d46ae188164391f67b5d8eb3883';

//todo: use only nacl
var	nacl = require("tweetnacl")
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
			id: participants.length,
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

	//the channel key used for each participant to 
	//create and transfer assets in the channel
	const channelKey = new Ed25519Keypair()

    //the channel hash is based in a plain text with random data
    const salt = Math.round(Math.random()*10000000+100000)
    const plainChannelHash = "channel : " + name + salt
	const channelHash = crypto.createHash('sha256').update(plainChannelHash, 'utf8').digest('hex')
	
	//the first participant is this server
	var config = cryptoConfigService.getPublicConfig()
	const partyKey = new Ed25519Keypair()

	var firstParticipant = {
		name: config.name,
		server: config.host+":"+config.port,
		publicKey:  partyKey.publicKey,
		privateKey: partyKey.privateKey
	}

	var channel = {
		name: name,
		publickey:  channelKey.publicKey,
		privatekey: channelKey.privateKey,
		sharedHash: channelHash,
		sharedSecret: "sharedSecret",
		participants: [firstParticipant]
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

		//get in an array the info for each participant
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

		//second iteration, calculate the sharedHash encoded for each participant with his publickey
		//alice is this node, and bob is each participant
		const config = cryptoConfigService.getPublicConfig()
		//const alice = cryptoConfigService.getKey()
		console.log("this is alice:")
		//console.log(alice)

var nacl = require('tweetnacl');
var naclutil = require('tweetnacl-util');
//nacl.util = require('tweetnacl-util');

var enc = naclutil.encodeBase64,
    dec = naclutil.decodeBase64;

	alice = nacl.box.keyPair()

    //var key = dec(vec[0]);
    //var nonce = dec(vec[1]);
    //var msg = dec(vec[2]);
    //var goodBox = dec(vec[3]);
    var key = dec("givKPH4F/eDcIEUZcws1+BIWqcnx35Ul4qkA7Ilxj1c=")
    var nonce = dec("crkCCNKADjatFscwlBoDjXw62dhwMNMp")
    var msg = dec("")
    var goodBox = dec("ebNFUe0iT6F8tkYMy5Cg2Q==")

    var box = nacl.secretbox(msg, nonce, key);
	console.log(box)

    //t.equal(enc(box), enc(goodBox));
    var openedBox = nacl.secretbox.open(goodBox, nonce, key);
    t.ok(openedBox, 'box should open');
    t.equal(enc(openedBox), enc(msg));
    process.exit(0)

		for (i in channel.participants) {
			if (typeof channel.participants[i].privateKey == "undefined") {

				console.log(channel.participants[i])
				//const bob = crypto.createECDH('secp256k1');  
				//bob.setPublicKey (channel.participants[i].publickey, 'hex')
				const partPublickey = channel.participants[i].publicKey

				const secret  = alice.computeSecret(partPublickey, 'hex', null);
				console.log("secret :", secret)


				const cipher = crypto.createCipher('aes-256-ctr', secret)
				var encrypted = cipher.update(channel.sharedHash, 'utf8', 'hex')
	  			encrypted += cipher.final('hex');
				console.log(encrypted)
				channel.participants[i].channelHashEncripted = encrypted
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

module.exports = {
	init:            init,
	getPublicConfig: getPublicConfig,
	getNodeInfo:     getNodeInfo,
    getKeyPair:      getKeyPair,
    getPublicKey:    getPublicKey,
    getPrivateKey:   getPrivateKey,
    getChannels:     getChannels,
    getChannel:      todo,
    postChannel:     postChannel,
    deleteChannel:   todo,
    postRenameNode:  postRenameNode,
    getParticipants: getParticipants,
    getParticipant:  getParticipant,
    postParticipant: postParticipant,
    deleteParticipant: deleteParticipant,
    postSignature:   postParticipantSignature
}



