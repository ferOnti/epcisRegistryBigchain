var Client = require('node-rest-client').Client;
var client = null;
var baseUrl = null;

var config = {};
var accounts;
var account;
var balance;
var lastContract = "";
var lastThingsPacking;

var mainAccount = null;


var appendContractAddressToList_seen = {};
function appendContractAddressToList(contractAddress)
{
    var options = $("#contractsId");
    if (! appendContractAddressToList_seen[contractAddress]) {
        options.append($("<option />").val(contractAddress).text(contractAddress));
        appendContractAddressToList_seen[contractAddress] = true;
    }
}

function getContractsAddrFromAccount(accountAddr) {
  client.get(baseUrl + "contracts/"+accountAddr, {}, function (contracts, response) {
    //console.log(contracts);

    if (contracts.length != 0) {
      //add contracts to the list
      appendContract(accountAddr, contracts);


      var seen = {};
      $.each(contracts, function() {
          appendContractAddressToList(this);
      });

    } else {
      setStatusBar("warning", "There are zero contracts");
    }
  });
}



function addContract() {
    const mainAccountId = mainAccount.id;
    $.get("newContract?mainId="+mainAccountId, function (data, status) {

        emptyTableContracts();
        loadContracts();

        if (typeof callback == "function") {
            callback(data);
        }
    });
}


function addAccount() {
    $.get("newAccount", function (data, status) {
        appendAccount(data.name, data.publicKey, data.hostname);
        if (typeof callback == "function") {
            callback(data);
        }
    });
}

//get the accounts from backend and store them int the global accounts var
function loadAccounts(callback) {
    $.get("getAccounts", function (data, status) {
        for (var i = 0; i < data.length; i++) {
            var account = data[i];
            /*
             var name = '--';

             for (var n in data.roleAccounts) {
             if (data.roleAccounts[n].address == acc) {
             name = n;
             }
             }
             */
            appendAccount(account.name, account.publicKey, account.hostname);
        };

        if (typeof callback == "function") {
            callback(data);
        }
    });
}

//get the contracts from backend and store them int the global accounts var
function loadContracts(callback) {
    $.get("getContracts", function (data, status) {
        for (var i = 0; i < data.length; i++) {
            var contract = data[i];
            /*
             var name = '--';

             for (var n in data.roleAccounts) {
             if (data.roleAccounts[n].address == acc) {
             name = n;
             }
             }
             */
            appendContract(contract);
        };

        if (typeof callback == "function") {
            callback(data);
        }
    });
}


function getAccounts() {
    $.get("getAccounts", function(data, status){
        console.log(data);
        for (var i = 0; i < data.length; i++) {
          appendParty(data[i])
        }

    });
}


function getParties() {
  $.get("/api/parties", function(data, status){
    for (var i = 0; i < data.length; i++) {
      appendParty(data[i])
    }
  });
}

function getCryptoConfig() {
  $.get("/crypto/config", function(data, status){
    $('#node-name').html(data.name) 
    $('#node-server').html(data.host + ":" + data.port) 
    $('#node-publicKey').html(data.publicKey.substr(0,30) + "..." + data.publicKey.substr(-10)) 
    for (var i = 0; i < data.participants.length; i++) {
      appendParty(data.participants[i])
    }
    for (var i = 0; i < data.channels.length; i++) {
      appendParty(data.channels[i])
    }
    console.log (data)
  });
}

function getStats() {
  $.get("/api/stats", function(data, status){
    console.log(data);
    $('#totalBlocks').html(data.bigchain) 
    $('#totalVotes').html(data.votes) 
    $('#totalAssets').html(data.assets) 
    $('#totalTransactions').html(data.txs.total) 
    $('#totalCreate').html(data.txs.create) 
    $('#totalTransfer').html(data.txs.transfer) 
    $('#totalGenesis').html(data.txs.genesis) 
    $('#totalBacklog').html(data.backlog) 
  });
}

function cleanDatabase() {
    $.get("cleanDatabase", function(data) {

    });
}

function updateMainAccount() {
    var name = $('#main_name').val();
    var hostname = $('#main_hostname').val();
    var data = { id: mainAccount.id, name: name, hostname: hostname};
    console.log(data);

    $.post("updateMainAccount", data, function(data, status){
        getMainAccount();
    });
}

window.onload = function() {
    getCryptoConfig();
    emptyTableParties();
    getParties();
    getStats();

    setInterval(getStats, 4000)
  /*
  client = new Client();
  baseUrl = window.location.href;

  //get config file for the web app
  client.get(baseUrl + "config", {}, function (clientConfig, response) {
    config = clientConfig;
    account = config.contractDeployer;

  });
  */

  $('.navbar-nav a[href="#tab_blocks"]').tab('show')

}
