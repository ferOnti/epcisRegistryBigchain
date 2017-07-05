var Client = require('node-rest-client').Client;
var client = null;
var baseUrl = null;

var config = {};
var accounts;
var account;

var mainAccount = null;

var initDialogs = function() {

  var options = {
    backdrop: true,
    keyboard: true, 
    show: false
  }

  //nodeInfo
  var dialog1 = $('#nodeInfoDialog').modal(options)

  dialog1.on('show.bs.modal', function(event) {
    var modal = $(this)
    modal.find('#node-info').val("")
    $.get("/crypto/nodeInfo", function(data, status){
      modal.find('#node-info').val(data)
    });
  })

  //addParticipant
  var dialog2 = $('#addParticipantDialog').modal(options)

  dialog2.on('show.bs.modal', function(event) {
    var modal = $(this)
    $('#addpart-statusbar').hide()
    $('#addpart-statusbar').html("")
    modal.find('#node-signature').val("")
  })

  var btnAddParticipant = $('#btnAddParticipant').modal(options)
  btnAddParticipant.on('click', function(event) {
    var modal = $(this)
    var signature = $('#node-signature').val()
    //sanitize
    signature = signature.replace(/[`~!@#$%^&*()_|\-?;:'",.<>\{\}\[\]\\]/gi, '')

    var data = '{"signature":""}'
    if (typeof signature != "undefined") {
      data = '{"signature":"' + signature + '"}'
    }
    
    $.ajax({
      url: "/crypto/participant",
      method: "POST",
      data: data,
      contentType: "application/json",
      processData: false,
      dataType: "json",
      success: function(data, status){
        $('#addParticipantDialog').modal('hide')
      },
      error: function(error, status){
        err = error.responseJSON
        $('#addpart-statusbar').show()
        $('#addpart-statusbar').html(err.message)
        console.error(err)
      }
    });
 
  })

  //changeInfo
  var dialog3 = $('#changeInfoDialog').modal(options)

  dialog3.on('show.bs.modal', function(event) {
    var modal = $(this)
  })

}

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

function getNodeInfo() {
  $('#nodeInfoDialog').modal('show')
}

function changeNodeInfo() {
  $('#changeInfoDialog').modal('show')
}

function addParticipant() {
  $('#addParticipantDialog').modal('show')
}

function getCryptoConfig() {
  $.get("/crypto/config", function(data, status){

    var source   = $("#participants-template").html();
    var template = Handlebars.compile(source);
    $('#participantList').html(template(data))
    
    $('#node-name').html(data.name) 
    $('#node-server').html(data.host + ":" + data.port) 
    $('#node-publicKey').html(data.publicKey) 
    
    //console.log (data)
  });
}

function getStats() {
  $.get("/api/stats", function(data, status){
    //console.log(data);
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
    initDialogs()

    getCryptoConfig();
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

  //$('.navbar-nav a[href="#tab_blocks"]').tab('show')
  $('.navbar-nav a[href="#tab_participants"]').tab('show')

}
