var BigchainDB  = require( 'bigchaindb-driver')
var parseString = require('xml2js').parseString;
var config = require('../../config.json');


const API_PATH =  config.bigchaindb.server

const alice = new BigchainDB.Ed25519Keypair()

var allEpcidPromises = []

/*
	get an asset from database, and then try to open
	check every channel this node have access and try to open the asset
*/
var getAsset = function (id) {

    var cryptoConfigService = require("./cryptoConfigService")
    var mongoService = require("./mongoService")

	return new Promise( (resolve, reject) => {
		mongoService.getAsset(id)
			.then((doc) => {
				if (doc == null) {
					reject("asset with id " + id + " does not exists")
				} else {
			    	var cryptoService = require("./cryptoService");
					return cryptoService.openAsset(doc.data)
				}
			})
			.then((assetData) => resolve(assetData))
			.catch((err)=>{reject(err)})
	})

}

//deprecated, since search is not so good
var getEpcisAsset = function (epcid) {
	let conn = new BigchainDB.Connection(API_PATH)

	return new Promise( (resolve, reject) => {
		console.log("  getEpcisAsset: " + epcid)
		conn.searchAssets(epcid)
			.then( (res) => { resolve(res)} )
	})

}

var getTransaction = function (txid) {
	let conn = new BigchainDB.Connection(API_PATH)

	return new Promise( (resolve, reject) => {
		//console.log("  getTransaction: " + txid)
		conn.getTransaction(txid)
			.then( (res) => { resolve(res)} )
	})

}

var getLastTransaction = function (assetid) {
	let conn = new BigchainDB.Connection(API_PATH)

	return new Promise( (resolve, reject) => {
		console.log("  getTransactions: " + assetid)
		conn.listTransactions(assetid)
			.then( (res) => { 
				if (typeof(res)=="object" && res.length >0) {
					last = res[res.length -1]
				}
				resolve(last)
			} )
	})

}

var postEpcisAsset = function(epcisAsset) {
	// Construct a transaction payload 
	const tx = BigchainDB.Transaction.makeCreateTransaction(
	    epcisAsset, //asset 
    	epcisAsset, //metadata
    	[ BigchainDB.Transaction.makeOutput(
            BigchainDB.Transaction.makeEd25519Condition(alice.publicKey))
    	],
    	alice.publicKey
	)
 
	// Sign the transaction with private keys 
	const txSigned = BigchainDB.Transaction.signTransaction(tx, alice.privateKey)
	//console.log(txSigned)

	// Send the transaction off to BigchainDB 
	var conn = new BigchainDB.Connection(API_PATH)

	console.log(txSigned.id)
	return conn.postTransaction(txSigned)
    	.then(() => conn.pollStatusAndFetchTransaction(txSigned.id))
	    .then(res => {
    	    console.log(res)
	        console.log('Transaction', txSigned.id, 'accepted')
    	})
}

var updateEpcisAsset = function(epcisAsset, dbAsset, txAsset) {

	const tx = BigchainDB.Transaction.makeTransferTransaction(
	    txAsset,
	    epcisAsset,
    	[ BigchainDB.Transaction.makeOutput(
            BigchainDB.Transaction.makeEd25519Condition(alice.publicKey), "1")
    	],
	    0
	)
	// Sign the transaction with private keys 
	const txSigned = BigchainDB.Transaction.signTransaction(tx, alice.privateKey)

	// Send the transaction off to BigchainDB 
	let conn = new BigchainDB.Connection(API_PATH)

	return conn.postTransaction(txSigned)
    	.then(() => conn.pollStatusAndFetchTransaction(txSigned.id))
	    .then(res => {
	        console.log('Transaction', txSigned.id, 'accepted (update)')
    	})
}

//check if the assets already exists in the bigchainDB
//if already exists => update the new asset in the metadada
//if not exist => the metada and the asset-data are the same

var updateObjectEvent = function(asset) {
	//check if the epcis asset already exists
	return new Promise( (resolve, reject) => {
		getEpcisAsset(asset.epcid).then(
			(dbAsset) => {
				//console.log(dbAsset)
				if (typeof(dbAsset) == "object" && dbAsset.length == 0 ) {
					postEpcisAsset(asset)	
						.then(()=> {resolve(true)} )
				} else {
					//console.log("  the asset already exists")
					//getTransaction(dbAsset[0].id)
					getLastTransaction(dbAsset[0].id)
						.then( (tx) => {
							updateEpcisAsset(asset, dbAsset, tx)
								.then(()=> {resolve(true)} )
						})
				}
			}
		)
	})
}

var processObjectEvent = function (object) {
	if (typeof(object.epcList[0]['epc']) == "undefined") {
		return new Promise( (resolve,reject) => {
			resolve(true)
		})
	}

    var epcidPromises = []

	for (epcid of object.epcList[0].epc ) {
		var sanitizedEpcis = epcid.replace(/:/g, '_').replace(/\./g, '_');
		var asset = { 
			epcid: sanitizedEpcis
		}

		if (typeof(object.eventTime) != "undefined") {
			asset.eventTime= object.eventTime[0]
		}

		if (typeof(object.recordTime) != "undefined") {
			asset.recordTime= object.recordTime[0]
		}

		if (typeof(object.eventTimeZoneOffset) != "undefined") {
			asset.eventTimeZoneOffset= object.eventTimeZoneOffset[0]
		}

		if (typeof(object.baseExtension[0].eventId) != "undefined") {
			asset.eventId= object.baseExtension[0].eventId[0]
		}

		if (typeof(object.action) != "undefined") {
			asset.action= object.action[0]
		}

		if (typeof(object.bizStep) != "undefined") {
			asset.bizStep= object.bizStep[0]
		}

			//disposition: object.disposition[0],
			//readPoint: object.readPoint[0],
			//bizLocation: object.bizLocation[0]

		//wait until all promises are completed	
		//epcidPromises.push(updateObjectEvent(asset))
		allEpcidPromises.push(updateObjectEvent(asset))
	}     	

	if (allEpcidPromises.length < 50) {
		return Promise.resolve()
	}

	return new Promise( (resolve,reject) => {
		console.log("wait for all pending promises")
		console.log(allEpcidPromises.length)
		var allPromises = Promise.all(allEpcidPromises)
		
		allPromises.then( function(res) {
			//console.log("after  - wait for all promises")
			allEpcidPromises = []
			console.log(allEpcidPromises.length)
 			resolve()
 		})
	})
}

var processLine = function(line) {
	return new Promise( (resolve, reject) => {
		parseString(line, function (err, result) {
			if (result["ObjectEvent"]) {
				processObjectEvent(result["ObjectEvent"])
					.then(resolve)
			} else {
				resolve(false)
			}
		})
	});
}

/*
	save an epcis event
	this is a preliminar version, just to txAsset
*/
var postEpcisEvent = function(channel, epcisEvent) {
	return new Promise( (resolve, reject) => {
		if (typeof channel == "undefined" || channel == null) {
			reject("channel name could not be empty string")
			return
		}
		var asset = {}
		if (typeof epcisEvent.objectevent != "undefined" ) {
			var obj = epcisEvent.objectevent
			if (obj.eventtime && obj.eventtime.length >0) {
				asset.eventTime = obj.eventtime[0]
			}
			if (obj.recordtime && obj.recordtime.length >0) {
				asset.recordTime = obj.recordtime[0]
			}
			if (obj.eventtimezoneoffset && obj.eventtimezoneoffset.length >0) {
				asset.eventTimeZoneOffset = obj.eventtimezoneoffset[0]
			}
			if (obj.baseextension && obj.baseextension.length >0) {
				eventid = obj.baseextension[0].eventid
				asset.eventId = eventid[0]
			}
			if (obj.epclist && obj.epclist.length >0) {
				epclist = obj.epclist[0]
				asset.epcList = epclist.epc
			}
			if (obj.action && obj.action.length >0) {
				asset.action = obj.action[0]
			}
			if (obj.disposition && obj.disposition.length >0) {
				asset.disposition = obj.disposition[0]
			}
			if (obj.readpoint && obj.readpoint.length >0) {
				readpoint = obj.readpoint[0]
				asset.readpoint = readpoint.id[0]
			}
			if (obj.bizlocation && obj.bizlocation.length >0) {
				bizlocation = obj.bizlocation[0]
				asset.bizlocation = bizlocation.id[0]
			}
			//todo: 
			// - bizTransaction
			// - thingList
			if (obj['vizix:thinglist'] && obj['vizix:thinglist'].length >0) {
				thinglist = obj['vizix:thinglist'][0]
				thing = thinglist['vizix:thing'][0]
				//console.log(thing)
				//asset.thinglist = thinglist
			}
		}

		if (asset == {}) {
			reject ("empty event")
		}
		postAsset(channel, asset)
			.then( (res) => { resolve(res)})
			.catch( (err) => { reject(err)})
	})
}

/* 
	save the asset in the specified channel
	name is the channel name
*/

var postAsset = function(name, assetData) {
	return new Promise( (resolve, reject) => {
		if (typeof name == "undefined" || name=="") {
			reject("channel name could not be empty string")
			return
		}

	    var cryptoService = require("./cryptoService");
	    var cryptoConfigService = require("./cryptoConfigService")

	   	var allChannels = cryptoConfigService.getChannels()

	   	var channel = null
	   	for (var i in allChannels) {
	   		if (allChannels[i].name == name) {
	   			channel = allChannels[i]
	   		}
	   	}
		if (channel == null) {
			reject("invalid channel name")
			return
		}

		var nacl = require("tweetnacl")
		nacl.util = require('tweetnacl-util')
		var bs58 = require('bs58');
		var stringify = require('json-stable-stringify');

		const channelPublicKey = bs58.decode(channel.publicKey)
		const channelSecretKey = bs58.decode(channel.secretKey)

		const channelSharedSignKey = bs58.decode(channel.sharedSignKey)
		const nonce = nacl.randomBytes(24)
		const message = nacl.util.decodeUTF8( stringify(assetData) )


		const encryptedMessage = nacl.secretbox(message, nonce, channelSharedSignKey)
		//const encryptedMessage = nacl.box(message, nonce, channelPublicKey, channelSecretKey)
		const encrypted = bs58.encode(encryptedMessage)
	
		assetId = assetData.id ? assetData.id : bs58.encode(nacl.randomBytes(8))
		assetType = assetData.assetType ? assetData.assetType : 'generic'

		var encryptedAsset = {
			channel: name,
			assetType: assetType,
			assetId: assetId,
			nonce:   bs58.encode(nonce),
			encrypted: encrypted
		}

		// Construct a transaction payload 
		const tx = BigchainDB.Transaction.makeCreateTransaction(
		    encryptedAsset, //asset 
	    	assetData, //metadata
	    	[ BigchainDB.Transaction.makeOutput(
	            BigchainDB.Transaction.makeEd25519Condition(bs58.encode(channelPublicKey)))
	    	],
	    	bs58.encode(channelPublicKey)
		)

		// Sign the transaction with private keys 
		const txSigned = BigchainDB.Transaction.signTransaction(tx, bs58.encode(channelSecretKey))
		//console.log(txSigned)

		// Send the transaction off to BigchainDB 
		let conn = new BigchainDB.Connection(API_PATH)

		conn.postTransaction(txSigned)
    	//.then(() => conn.pollStatusAndFetchTransaction(txSigned.id))
	    .then((res) => {
	        console.log('Transaction', txSigned.id, 'sent')
	        resolve({id:txSigned.id, data: encrypted})
    	})
    	.catch((err) => {reject(err)})
	})

}

module.exports.getAsset           = getAsset
module.exports.getEpcisAsset      = getEpcisAsset
module.exports.processObjectEvent = processObjectEvent
module.exports.postEpcisAsset     = postEpcisAsset
module.exports.postAsset          = postAsset
module.exports.postEpcisEvent     = postEpcisEvent
module.exports.processLine        = processLine
module.exports.getTransaction     = getTransaction






