
var cryptojs = require("./cryptojs.js");

function createMainAccount(mongoDB, hostname, callback) {
    var collection = mongoDB.collection('accounts');

    var diffieHellman = cryptojs.getDiffieHellman();
    var prime = diffieHellman.getPrime();
    var primeHex = diffieHellman.getPrime('hex');

    // Find main account or create a new one in case it does not exists
    collection.find({ main:true}).toArray(function(err, docs) {
        if (docs.length ==0) {

            var key = diffieHellman.generateKeys('hex');
            console.log("    prime is " + primeHex);
            console.log("    new public key: " + key);

            var mainAccount = {};
            mainAccount.name = 'Main Party';
            mainAccount.privateKey = diffieHellman.getPrivateKey('hex');
            mainAccount.publicKey  = diffieHellman.getPublicKey('hex');
            mainAccount.prime      = diffieHellman.getPrime('hex');
            mainAccount.main       = true;
            mainAccount.hostname   = hostname;

            collection.insertOne(mainAccount);
            callback(cryptojs.encryptMainAccount(mainAccount));
        } else {
            callback(cryptojs.encryptMainAccount(docs[0]));
        }
    });
};


function getAccounts(mongoDB, callback) {
    var collection = mongoDB.collection('accounts');

    // Find main account or create a new one in case it does not exists
    collection.find({ main: false}).toArray(function(err, docs) {
        callback(docs);
    });
};

function getContracts(mongoDB, callback) {
    var collection = mongoDB.collection('contracts');

    // Find main account or create a new one in case it does not exists
    collection.find({}).toArray(function(err, docs) {
        callback(docs);
    });
};

function cleanDatabase(mongoDB, callback) {
    var collAccounts  = mongoDB.collection('accounts');
    var collContracts = mongoDB.collection('contracts');

    collAccounts.drop();
    collContracts.drop();
    callback( {accounts: true, contracts: true} );
};

function newAccount(mongoDB, hostname, callback) {
    var collection = mongoDB.collection('accounts');

    var diffieHellman = cryptojs.getDiffieHellman();
    var prime = diffieHellman.getPrime();
    var primeHex = diffieHellman.getPrime('hex');


    var key = diffieHellman.generateKeys('hex');

    var mainAccount = {};
    mainAccount.name = 'Party ' + key.substring(0,4);
    //mainAccount.privateKey = diffieHellman.getPrivateKey('hex');
    mainAccount.publicKey  = diffieHellman.getPublicKey('hex');
    mainAccount.main       = false;
    mainAccount.hostname   = hostname;

    console.log("    account name: " + mainAccount.name);
    console.log("    host    name: " + mainAccount.hostname);
    console.log("    public   key: " + diffieHellman.getPublicKey('hex'));
    console.log("    private  key: " + diffieHellman.getPrivateKey('hex'));

    collection.insertOne(mainAccount);
    callback(mainAccount);

};

function getContractNumber(mongoDB, callback) {
    var collection = mongoDB.collection('contracts');

    //var contract = collection.insertOne(contract);
    return Math.round(Math.random()*1000);
}

function updateMainAccount(mongoDB, data, callback) {
    var colAccounts = mongoDB.collection('accounts');

    colAccounts.findAndModify(
        {_id: require('mongodb').ObjectID(data._id)}, // query
        [],  // sort order
        {$set: {name: data.name, hostname: data.hostname}},
        {upsert: false}
    );

    if (typeof callback == "function") {
        callback(data);
    }

}

function newContract(mongoDB, mainId, callback) {
    const hash = cryptojs.getHash();
    const diffieHellman = cryptojs.getDiffieHellman();


    var colContracts = mongoDB.collection('contracts');
    var colAccounts  = mongoDB.collection('accounts');
    var contractNumber = getContractNumber(mongoDB);

    var contractName = "Contract # " + contractNumber;
    var contractPlainSecret = "secret " + contractNumber + "-"+ Math.random();


    hash.update(contractName);
    var contractSecret = hash.digest('hex');

    console.log("    contract secret: " + contractPlainSecret);

    var parties = [];
    var party = [];

    //setup parties for this contract

    colAccounts.find({}).toArray(function(err, docs) {
        for (var i = 0; i< docs.length; i++) {
            var account = docs[i];
            if (account.main == true || Math.random()*10 < 3) {

                party[i] = {};
                party[i].diffieHellman = cryptojs.getDiffieHellman();

                party[i].diffieHellman.generateKeys('hex');
                console.log("    adding " + account.name + " to " + contractNumber)

                party[i].id = require('mongodb').ObjectID(account._id);
                party[i].name = account.name;
                party[i].publicKey = party[i].diffieHellman.getPublicKey('hex');
                if (account.main) {
                    party[i].privateKey = party[i].diffieHellman.getPrivateKey('hex');
                }
                //todo change to valid Eris account
                const hashEris = cryptojs.getHash();
                hashEris.update(account.name + Math.random());
                party[i].erisAccount =  hashEris.digest('hex');

                var partyForContract = {};
                partyForContract.id          = party[i].id;
                partyForContract.name        = party[i].name;
                partyForContract.erisAccount = party[i].erisAccount;
                partyForContract.publicKey   = party[i].publicKey;
                if (typeof party[i].privateKey != "undefined") {
                    partyForContract.privateKey = party[i].privateKey;
                }
                parties.push(partyForContract);

                var partyContractData = {
                    contractNumber: contractNumber,
                    public_key: party[i].publicKey,
                };

                if (account.main) {
                    partyContractData.private_key = party[i].privateKey
                }

                /* don't save the contract info inside the accounts collection
                colAccounts.findAndModify(
                    {_id: require('mongodb').ObjectID(account._id)}, // query
                    [],  // sort order
                    {$push: {contracts: partyContractData}}, // replacement, replaces only the field "hi"
                    {upsert: true}
                );
                */
            }
        }

        console.log("    adding contract " + contractNumber )

        var contract = {};
        contract.number = contractNumber;
        contract.name = contractName;
        contract.plainSecret = contractPlainSecret;
        contract.secret = contractSecret;
        contract.parties = parties;

        colContracts.insertOne(contract);

        callback(contract);
    });

};


module.exports = {
    createMainAccount: createMainAccount,
    getAccounts: getAccounts,
    getContracts: getContracts,
    newAccount: newAccount,
    newContract: newContract,
    cleanDatabase: cleanDatabase,
    updateMainAccount: updateMainAccount
}
