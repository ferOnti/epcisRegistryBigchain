
var config = require('../../config.json');

// Global variables
var mongoDB = null;
var mongoClient = require('mongodb').MongoClient;

var cryptojs = require("./cryptojs.js");
var sprintf = require('sprintf').sprintf;

var connectMongoServer = function() {
	return new Promise( (resolve, reject) => {
	 	// Use connect method to connect to the Server
		mongoClient.connect(config.mongodb.url, function(err, db) {
		    if (err) {
		        console.log (err);
		        reject(err)
		        process.exit(0);
		    }
		    console.log("Connected correctly to server");
		    mongoDB = db;
		    resolve()
		});
	})
}

var getBlock = function() {
    var collection = mongoDB.collection('assets');
    collection.count(function(err, count) {
        console.log(count); 
    })

    // Find main account or create a new one in case it does not exists
    collection.find({ }).limit(1).toArray(function(err, docs) {
    	console.log(docs)
    	console.log(err)
    });

    // Get first documents from cursor using each
    col.find({a:1}).limit(2).each(function(err, doc) {
      if(doc) {
        // Got a document
      } else {
        db.close();
        return false;
      }
    });

    // Get first documents from cursor
    col.find({a:1}).limit(2).next(function(err, doc) {
      assert.equal(null, err);
      assert.ok(doc != null);
      db.close();
    });

}

var addAccount = function(partyName) {
    var collection = mongoDB.collection('participants');

    var diffieHellman = cryptojs.getDiffieHellman();
    var prime = diffieHellman.getPrime();
    var primeHex = diffieHellman.getPrime('hex');

    return new Promise((resolve, reject) => {
	    // Find main account or create a new one in case it does not exists
	    collection.find({ name:partyName}).toArray(function(err, docs) {
	    	if (err) {
	    		console.error(err)
	    		reject(err)
	    	}

	        if (docs.length == 0) {
	            var key = diffieHellman.generateKeys('hex');
	            //console.log("    prime is " + primeHex);
	            //console.log("    new public key: " + key);

	            var mainAccount = {};
	            mainAccount.name = partyName;
	            mainAccount.privateKey = diffieHellman.getPrivateKey('hex');
	            mainAccount.publicKey  = diffieHellman.getPublicKey('hex');
	            mainAccount.prime      = diffieHellman.getPrime('hex');
	            //mainAccount.main       = true;
	            //mainAccount.hostname   = hostname;

	            collection.insertOne(mainAccount);
	            resolve(mainAccount)
	        } else {
	            resolve(docs[0]);
	        }
	    });
    })
}

var getParties = function() {
	return new Promise((resolve, reject) => {
	    var collection = mongoDB.collection('participants');
	    collection.find({ }).toArray(function(err, docs) {
	    	console.log(docs)
	    	resolve(docs);
	    });
	})
    /*
    collection.find({ }).each(function(err, doc) {
      	if(doc) {
        	// Got a document
      	} else {
        	db.close();
        	return false;
      	}
    });
    */
}

//simple counts
var countBigchain = function() {
	return new Promise((resolve, reject) => {
	    var collection = mongoDB.collection('bigchain');
    	collection.count(function(err, count) {
        	resolve({bigchain: count}); 
    	})
    })
}

var countParticipants = function() {
	return new Promise((resolve, reject) => {
	    var collection = mongoDB.collection('participants');
    	collection.count(function(err, count) {
        	resolve({participants: count}); 
    	})
    })
}

var countBacklog = function() {
	return new Promise((resolve, reject) => {
	    var collection = mongoDB.collection('backlog');
    	collection.count(function(err, count) {
        	resolve({backlog: count}); 
    	})
    })
}

var countVotes = function() {
	return new Promise((resolve, reject) => {
	    var collection = mongoDB.collection('votes');
    	collection.count(function(err, count) {
        	resolve({votes: count}); 
    	})
    })
}

var countAssets = function() {
	return new Promise((resolve, reject) => {
	    var collection = mongoDB.collection('assets');
    	collection.count(function(err, count) {
        	resolve({assets: count}); 
    	})
    })
}

var countTransactions = function() {
    var txs = {}
	//map reduce to count how many transactions are in the bigchaindb
	var map = function() {
	    this.block.transactions.forEach(function (tx) {
	        var key = tx.operation
	        var value = 1
	    	emit(key, value);  
	    })
	};

	var reduce = function(key, values) {
	    //var reduceVal = {count:0, sum: 0}
	    var reduceVal = 0
	    values.forEach(function(value) {   
	        reduceVal += value
	        //reduceVal.count += value.count
	        //reduceVal.sum   += value.sum
	    })
	    return reduceVal;
	};

	return new Promise((resolve, reject) => {
	    var bigchainCollection = mongoDB.collection('bigchain');
		bigchainCollection.mapReduce(
		    map,
		    reduce,
		    {
		        query:{},
		        // sort: {'count': -1},
		        // limit: 10,
		        // jsMode: true,
		        // verbose: false,
		        out: { inline: 1 }
		    },
		    function(err, results) {
		        var sum = 0
		        txs['create'] = 0
		        txs['genesis'] = 0
		        txs['transfer'] = 0
		        if (results && results.length > 0) {
			        results.forEach(function(res) {
			  	        if (res["_id"] == "CREATE") {
			  	        	txs['create'] = res.value
			  	        	sum += res.value
			  	        }
			  	        if (res["_id"] == "GENESIS") {
			  	        	txs['genesis'] = res.value
			  	        	sum += res.value
			  	        }
			  	        if (res["_id"] == "TRANSFER") {
			  	        	txs['transfer'] = res.value
			  	        	sum += res.value
			  	        }
			  		})
			    }
  	        	txs['total'] = sum
  	        	res = {txs: txs}
  	        	resolve(res)
		    }
		);

    })
}

var pushResult = function(stats, res) {
	return new Promise( (resolve,reject) => {
		s = "a" + stats.length;
		o = {}
		o[s] = res
		stats.push(o );
		//console.log(stats)
		resolve(stats)
	}) 

}
var getStats = function() {
	var stats = []
	var promises = []
	promises.push(countBigchain())
	promises.push(countParticipants())
	promises.push(countBacklog())
	promises.push(countVotes())
	promises.push(countAssets())
	promises.push(countTransactions())
	
	return new Promise((resolve, reject) => {
		var allEpcidPromises = Promise.all(promises)

		allEpcidPromises.then( function(res) {
			stats = {}
			for (var i=0; i<res.length;i++) {
				for(row in res[i]) {
					stats[row] = res[i][row]
				}
			}
			resolve(stats)
		}, function(err) {
			console.error(err)
			reject(err)
		})
	})
}

var getParticipant = function(name) {
    var collection = mongoDB.collection('participants');

	return new Promise((resolve, reject) => {
	    collection.findOne({ name: name}, function(err, doc) {
		   	if (err) {
	   			console.error(err)
	   			reject(err)
		   	}
		   	resolve(doc)
		})
	})
}

var secretTest = function() {
	/*
    var partyA
    var partyB
    var partyC

	var promises = []
	promises.push(getParticipant('party A').then ( (party) => { partyA = party}))
	promises.push(getParticipant('party B').then ( (party) => { partyB = party}))
	promises.push(getParticipant('party C').then ( (party) => { partyC = party}))

	var allEpcidPromises = Promise.all(promises)
	allEpcidPromises.then( function(res) {
       	console.log(partyA, partyB, partyC)
	*/

  var crypto = require('crypto')


  const alice = crypto.createECDH('secp256k1');
  const bob = crypto.createECDH('secp256k1');  
  const carol = crypto.createECDH('secp256k1');  
  const x = crypto.createECDH('secp256k1');  
  const y = crypto.createECDH('secp256k1');  
  
  const algorithm = 'aes-256-ctr';
  const password  = 'd77c0d46ae188164391f67b5d8eb3883';

  alice.setPrivateKey(
    crypto.createHash('sha256').update('alice', 'utf8').digest()
  );
  bob.setPrivateKey(
    crypto.createHash('sha256').update('bob', 'utf8').digest()
  );
  carol.setPrivateKey(
    crypto.createHash('sha256').update('carol', 'utf8').digest()
  );
  //alice.generateKeys();
  console.log("---")

  //carol.generateKeys();
  const x1 = crypto.createECDH('secp256k1');  
  const x2 = crypto.createECDH('secp256k1');  
  const x3 = crypto.createECDH('secp256k1');  
  const y1 = crypto.createECDH('secp256k1');  
  const y2 = crypto.createECDH('secp256k1');  
  const y3 = crypto.createECDH('secp256k1');  

  const channelHash = crypto.createHash('sha256').update('channel hash', 'utf8').digest('hex')
  //const channelHash = 'channel hash'

  const secret1  = alice.computeSecret(bob.getPublicKey(), null, null);
  console.log("secret1:", secret1)
  var cipher1 = crypto.createCipher('aes-256-ctr', secret1)
  var encrypted1 = cipher1.update(channelHash, 'utf8', 'hex')
      encrypted1 += cipher1.final('hex');
  console.log(encrypted1)
  var decipher1 = crypto.createDecipher('aes-256-ctr', secret1)
  var plain1 = decipher1.update(encrypted1, 'hex', 'utf8')
      plain1 += decipher1.final('utf8');
  console.log(plain1)

  const secret2  = alice.computeSecret(carol.getPublicKey(), null, null);
  console.log("secret2:", secret2)
  var cipher2 = crypto.createCipher('aes-256-ctr', secret2)
  var encrypted2 = cipher2.update(channelHash, 'utf8', 'hex')
      encrypted2 += cipher2.final('hex');
  console.log(encrypted2)
  var decipher2 = crypto.createDecipher('aes-256-ctr', secret2)
  var plain2 = decipher2.update(encrypted2, 'hex', 'utf8')
      plain2 += decipher2.final('utf8');
  console.log(plain2)

  process.exit(0)
 

/*
  const secret1  = alice.computeSecret(alice.getPublicKey(), null, null);
  console.log("secret1:", secret1)
  x1.setPrivateKey(secret1);
  const secret2 = x1.computeSecret(bob.getPublicKey(), null, null);
  console.log("secret2:", secret2)
  x2.setPrivateKey(secret2);
  const secret3 = x2.computeSecret(carol.getPublicKey(), null, null);
  console.log("secret3:", secret3)

  const secret4  = bob.computeSecret(bob.getPublicKey(), null, null);
  console.log("secret4:", secret4)
  y1.setPrivateKey(secret4);
  const secret5 = y1.computeSecret(carol.getPublicKey(), null, null);
  console.log("secret5:", secret5)
  y2.setPrivateKey(secret5);
  const secret6 = y2.computeSecret(alice.getPublicKey(), null, null);
  console.log("secret6:", secret6)
  process.exit(0)

*/
  const alice_secret  = alice.computeSecret(bob.getPublicKey(), null, null);
  const alice_secret2 = alice.computeSecret(carol.getPublicKey(), null, null);
  console.log("alice secret:", alice_secret)

  const bob_secret  = bob.computeSecret(alice.getPublicKey(), null, null);
  const bob_secret2 = bob.computeSecret(carol.getPublicKey(), null, 'hex');
  console.log("bob   secret:", bob_secret)


  //x.setPrivateKey(alice_secret);
  //x.setPublicKey(alice_secret);
  //const secret1 = carol.computeSecret(x.getPublicKey(), null, 'hex');
  //const secret1 = carol.computeSecret(x.getPublicKey(), null, 'hex');
  //console.log(secret1)

  //y.setPrivateKey(alice_secret2);
  //y.setPublicKey(alice_secret2);
  //const secret2 = bob.computeSecret(y.getPublicKey(), null, 'hex');
  //const secret2 = bob.computeSecret(y.getPublicKey(), null, 'hex');
  //console.log(secret2)

  process.exit(0)

  algo = 'aes-256-ctr'
  var cipher = crypto.createCipher(algo,partyA.privateKey)
  var encrypted = cipher.update("foo-bar",'utf8','hex')
  encrypted += cipher.final('hex');
	console.log(encrypted)

	    const hash = cryptojs.getHash();
	    var diffieHellman = cryptojs.getDiffieHellman();
	    var prime = diffieHellman.getPrime();
	    var primeHex = diffieHellman.getPrime('hex');

        var contractId = 1;
        var secret     = partyA.privateKey

        var plain = "hello " + new Date().getTime()
        var encrypted = cryptojs.encryptMessage(secret, plain);
        console.log (encrypted);
        var decrypted = cryptojs.decryptMessage(secret, encrypted);
        console.log (decrypted);

        console.log ("-----");

        contractNumber = 1
	    var contractName = "Contract # " + contractNumber;
    	var contractPlainSecret = "secret " + contractNumber + "-"+ Math.random();


    	hash.update(contractName);
    	var contractSecret = hash.digest('hex');

    	console.log("    contract secret: " + contractPlainSecret);
/*
                party1 = {};
                party1.diffieHellman = cryptojs.getDiffieHellman();

                party1.diffieHellman.generateKeys('hex');

                party1.publicKey = party1.diffieHellman.getPublicKey('hex');
                if (account.main) {
                    party[i].privateKey = party[i].diffieHellman.getPrivateKey('hex');
*/

        var encrypted = cryptojs.encryptMessage(partyA.privateKey, contractSecret);
        console.log (encrypted);

        var encrypted = cryptojs.encryptMessage(partyB.privateKey, partyA.publicKey);
        console.log (encrypted);

    //})



}

module.exports = {
    connect:    connectMongoServer,
    getBlock:   getBlock,
    addAccount: addAccount,
    getParties: getParties,
    getStats:   getStats,
    secretTest: secretTest
}
