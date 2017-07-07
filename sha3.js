
//validate that one transaction is correct

//var cc = requirefrom 'five-bells-condition'
var clone = require('clone')
var base58 = require('bs58')
var cc = require('five-bells-condition');

console.log("\n\nsha3 - bigchaindb")

var BigchainDB  = require( 'bigchaindb-driver')
var epcisService = require('./epcisService')
var sha3_256 = require('js-sha3').sha3_256;

var config = require('./config.bulk.json');

const alice = new BigchainDB.Ed25519Keypair()
alice.publickey  = config.alice.publickey
alice.privatekey = config.alice.privatekey


epcisService.getTransaction("1875ac36593263c2d3f191f8d3fa785fa0c62f34b05d52f847bbf8e3e254c144")
	.then( (data) => {
		showTx(data)
		validateInputsTx(data)
		//makeTx({"a":1})
	})

//x = sha3_256(data);
//console.log(x)

//x2 = sha3_256.create().update(data).hex();
//console.log(x2)

showTx = function(data) {
	console.log("--------- -----------------------------------")
	console.log("txid     : " + data.id)
	console.log("operation: " + data.operation)
	console.log("inputs:")
	console.log(data.inputs)
	console.log("outputs:")
	console.log(data.outputs)
	console.log("--------- -----------------------------------")
}

validateInputsTx = function(data) {
	tx = clone(data)
	console.log("  there are " + tx.inputs.length + " inputs")
	tx.inputs.forEach(function (input, index) {
        //var publickey = input.owners_before[index];
        //console.log(publickey)
        //fulfillment = input.fulfillment
        //console.log("fulfillment " + input.fulfillment)
        fulfillment = tx.inputs[index].fulfillment 
        //tx.inputs[index].fulfillment = null
        console.log(fulfillment)

console.log("--")
        x = cc.Fulfillment.fromUri(fulfillment) 
        console.log(x)
console.log("--")

	    const serializedTransaction = BigchainDB.Transaction.serializeTransactionIntoCanonicalString(tx)
        const ed25519Fulfillment = new cc.Ed25519Sha256()
        ed25519Fulfillment.setPublickey( x.publickey)
        ed25519Fulfillment.setSignature( x.signature)
        var isValid = false
        try {
        	isValid = ed25519Fulfillment.validate(new Buffer(serializedTransaction))
	        console.log(ed25519Fulfillment)
    	} catch(e) {
    		console.error(e.message)
    	}
        console.log(isValid)

    })

/*    
	console.log(tx.outputs)
    const serializedTransaction = BigchainDB.Transaction.serializeTransactionIntoCanonicalString(tx)
    console.log(serializedTransaction)


        const privateKey = alice.privateKey
        const privateKeyBuffer = new Buffer(base58.decode(privateKey))
        ed25519Fulfillment.sign(new Buffer(serializedTransaction), privateKeyBuffer)
        const fulfillmentUri = ed25519Fulfillment.serializeUri()
		console.log(fulfillmentUri)
*/
    return
}

/*
makeTx = function(epcisAsset) {
	const tx = BigchainDB.Transaction.makeCreateTransaction(
	    epcisAsset, //asset 
    	epcisAsset, //metadata
    	[ BigchainDB.Transaction.makeOutput(
            BigchainDB.Transaction.makeEd25519Condition(alice.publickey))
    	],
    	alice.publickey
	)
	console.log("---------")
	console.log(tx)
	console.log("---------")
 
 	signTx(tx, alice.privatekey)

	// Sign the transaction with private keys 
	const txSigned = BigchainDB.Transaction.signTransaction(tx, alice.privatekey)
	console.log(txSigned)

}

signTx = function (transaction, ...privateKeys) {
    const signedTx = clone(transaction)
    console.log(signedTx)
    signedTx.inputs.forEach((input, index) => {
        const privateKey = privateKeys[index]
        const privateKeyBuffer = new Buffer(base58.decode(privateKey))
        const serializedTransaction = BigchainDB.Transaction.serializeTransactionIntoCanonicalString(transaction)

        const ed25519Fulfillment = new cc.Ed25519Sha256()
        ed25519Fulfillment.sign(new Buffer(serializedTransaction), privateKeyBuffer)
        const fulfillmentUri = ed25519Fulfillment.serializeUri()
console.log(fulfillmentUri)
        input.fulfillment = fulfillmentUri
    })

    return signedTx
}

*/

