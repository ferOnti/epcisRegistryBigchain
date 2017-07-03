function displayTimestamp(timestamp) {
  var d = new Date(timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var formattedDate = d.getDate()+"-"+months[d.getMonth()]+"-"+d.getFullYear() + " " +
    ("0" + d.getHours()).slice(-2) + ":" +
    ("0" + d.getMinutes()).slice(-2) + ":" +
    ("0" + d.getSeconds()).slice(-2);

  return formattedDate;
}

function clearEvents() {
  emptyTableEvents();
}

function clearStatusBar(){
  $("#statusbar").html("");
  $("#statusbar").removeClass("alert-default");
  $("#statusbar").removeClass("alert-info");
  $("#statusbar").removeClass("alert-danger");
  $("#statusbar").removeClass("alert-success");
  $("#statusbar").removeClass("alert-warning");
}
function setStatusBar( className, message) {
  clearStatusBar();
  $("#statusbar").html(message);
  if (className != "") {
    $("#statusbar").addClass("alert-" + className);
  } else {
    $("#statusbar").addClass("alert-info");
  }
}

function appendEvent(result) {

  var blockNumber = result.blockNumber;
  var blockHash = result.blockHash;
  var address   = result.address;
  var eventName = result.event;
  var typeName = result.type;

  var timestamp = web3.eth.getBlock(blockHash).timestamp;
  var gasUsed = web3.eth.getBlock(blockHash).gasUsed;

  var strArgs = "address: " + result.address + "<br>";
  strArgs += "transaction: " + result.transactionHash + "<br>";
  strArgs += "<br>";

  if (result.args!=null && typeof result.args != "undefined") {
    var keys = Object.keys(result.args);
    keys.forEach( function(t) {
      strArgs += t + " : " + result.args[t] + "<br>";
    })
  }


  $("#table-events").find('tbody')
    .prepend($('<tr>')
        .append($('<td>')
            .append($('<h6>').append("blockNumber: " + blockNumber ))
            .append($('<h6>').append("event: " + eventName ))
            .append($('<h6>').append(displayTimestamp(timestamp)) )
            .append($('<h6>').append("type: " + typeName) )
            .append($('<h6>').append("gas used: " + gasUsed) )
        )
        .append($('<td>')
            .append(strArgs)
        )
    );

}


function emptyTableParties() {
  $("#table-parties > tbody").html("");
}

function appendParty(doc) {
  $("#table-parties").find('tbody')
    .append($('<tr>')
        .append($('<td>')
            .append(doc.name)
        )
        .append($('<td>')
            .append(doc.publicKey)
        )
        .append($('<td>')
            .append(doc.privateKey)
        )
    );
}

function emptyTableEvents() {
  $("#table-events > tbody").html("");
}


function emptyTableContracts() {
  $("#table-contracts > tbody").html("");
  $("#contractsId").html("");
}


function appendContract(contract) {
    var sendMsgUrl = "contract/" + contract._id + "/message/" + contract.secret;
    $("#table-contracts").find('tbody')
        .append($('<tr>')
        .append($('<td>')
            .append(contract.name)
        )
            .append($('<td>')
                .append(contract.secret)
        )
            .append($('<td>')
                .append("<a href=\"" + sendMsgUrl + "\" >send message</a>" )
        )
      );
}



