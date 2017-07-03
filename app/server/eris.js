var fs = require ('fs');
var erisC = require("eris-contracts");

var setStringSub;  //subscribe to events

function connectErisServer(config) {
    var erisdbURL = config.eris.rpc;
    var accountData = require( __dirname + '/eris/accounts.json');
    var contractsManager = erisC.newContractManagerDev(erisdbURL, accountData.simplechain_full_000);
    return contractsManager;
}

function getSampleContract(config, contractsManager) {
    var contractAddress = config.sampleContract.address;
    var contractAbi = JSON.parse(fs.readFileSync( __dirname + "/eris/abi/" + contractAddress));

    sampleContract = contractsManager.newContractFactory(contractAbi).at(contractAddress);
    return sampleContract;
}

function sandbox(config, sampleContract) {
    var cryptojs = require("./cryptojs");

    subToSetString(config, sampleContract);
    getValue();

    setInterval(function() {
        var contractId = config.eris.contract.id;
        var secret     = config.eris.contract.secret;

        var plain = "sample " + new Date().getTime()
        var encrypted = cryptojs.encryptContractMessage(contractId, secret, plain);

        setMessage(plain, encrypted);
    }, 2000);

}




function getValue(callback) {
    sampleContract.getValue(function(error, result){
        if (error) {
            console.log(error);
            throw error
        }
        console.log(result);

        if (typeof callback == "function") {
            callback();
        }
    });
}


function setValue(value) {
    var encrypted = "(encrypted)" + value;
    sampleContract.setValue(value, encrypted, function(error, result){
        if (error) {
            throw error
        }
    });
}

function setMessage(plain, encrypted ) {
    sampleContract.setValue(plain, encrypted, function(error, result){
        if (error) {
            throw error
        }
    });
}

var subToSetString = function(config, contract) {
    var cryptojs = require("./cryptojs");

    contract.SetString(startCallback, eventCallback);

    function startCallback(error, eventSub){
        if (error) {
            throw error;
        }
        setStringSub = eventSub;
    }

    function eventCallback(error, event){
        if (event && typeof event.args != "undefined") {
            var args = event.args;
            var from = args._from;
            var index = args.index;
            var encrypted = args._encrypted;
            var contractId = config.eris.contract.id;
            var secret = config.eris.contract.secret;

            var plain = cryptojs.decryptContractMessage(contractId, secret, encrypted);

            console.log(index + " encrypted: " + encrypted + " plain: " + plain );
            //console.log(index + " from " + args._from + " plain: " + plain );
            //console.log("                                               encrypted: " + encrypted);
        }
    }
}

/*
 var stop = function(){
 if(setStringSub){
 // Optional callback.
 setStringSub.stop(function(error){
 if(error){
 console.error("Failed to stop sub for: " + myContract.address + ". Error: " + error.message);
 } else {
 console.log("Info: Stopped watching AddressSet events on: " + myContract.address);
 }
 });
 } else {
 console.log("Warning: No subscription has been started!");
 }
 }
 */


module.exports = {
    connectErisServer: connectErisServer,
    getSampleContract: getSampleContract,
    sandbox: sandbox,
    setMessage: setMessage
}
