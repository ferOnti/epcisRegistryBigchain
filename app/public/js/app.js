
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

  var btnAddParticipant = $('#btnAddParticipant')
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
        getCryptoConfig()
        $('#addpart-statusbar').show()
        $('#addpart-statusbar').html("success")
        $('#addParticipantDialog').modal('hide')
        $('#addpart-statusbar').hide()
      },
      error: function(error, status){
        err = error.responseJSON
        $('#addpart-statusbar').show()
        $('#addpart-statusbar').html(err.message)
      }
    });
  })

  //add channel 
  var changeProgressBar = function(percentage, label) {
    $("#createChannelBar").show()
    $("#createChannelBar").css("width", percentage);
    $("#createChannelBarLabel").html(label)
  }

  var dialog3 = $('#addChannelDialog').modal(options)

  dialog3.on('show.bs.modal', function(event) {
    var modal = $(this)
    $('#addchannel-statusbar').hide()
    $('#addchannel-statusbar').html("")
    $("#createChannelBar").hide()
    changeProgressBar("0%", "")
    //modal.find('#node-signature').val("")
  })

  var btnAddChannel = $('#btnAddChannel')
  btnAddChannel.on('click', function(event) {
    var modal = $(this)
    var channelName = $('#channel-name').val()
    var channelParticipants = []
    $('input:checkbox:checked').each(function() {
      channelParticipants.push($(this).val())
    });

    //sanitize
    channelName = channelName.replace(/[`~!@#$%^&*()_|\-?;:'",.<>\{\}\[\]\\]/gi, '')

    if (typeof channelName == "undefined") {
      channelName = ''
    }
    data = JSON.stringify({ name: channelName, participants: channelParticipants })

    $.ajax({
      url: "/crypto/channel",
      method: "POST",
      data: data,
      contentType: "application/json",
      processData: false,
      dataType: "json",
      success: function(data, status){
        getCryptoConfig()
        $('#addchannel-statusbar').hide()
        $('#addchannel-statusbar').html("")
        changeProgressBar("20%", "channel key")
        //$('#addChannelDialog').modal('hide')
        //$('#addchannel-statusbar').hide()
      },
      error: function(error, status){
        err = error.responseJSON
        $('#addchannel-statusbar').show()
        $('#addchannel-statusbar').html(err.message)
        console.error(err)
      }
    });
 
  })

  //changeInfo
  var dialog4 = $('#changeInfoDialog').modal(options)

  dialog4.on('show.bs.modal', function(event) {
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


function getNodeInfo() {
  $('#nodeInfoDialog').modal('show')
}

function changeNodeInfo() {
  $('#changeInfoDialog').modal('show')
}

function addParticipant() {
  $('#addParticipantDialog').modal('show')
}

function createChannel() {
  $('#addChannelDialog').modal('show')
  $.get("/crypto/config", function(data, status){

    var source   = $("#participantscheckbox-template").html();
    var template = Handlebars.compile(source);
    $('#participantsCheckboxList').html(template(data))
  })
}

function getCryptoConfig() {
  $.get("/crypto/config", function(data, status){

    var source   = $("#participants-template").html();
    var template = Handlebars.compile(source);
    $('#participantList').html(template(data))
    
    $('#node-name').html(data.name) 
    $('#node-server').html(data.host + ":" + data.port) 
    $('#node-publicKey').html(data.publicKey) 
    
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

window.onload = function() {
  initDialogs()

  getCryptoConfig();
  getStats();

  setInterval(getStats, 4000)

  //$('.navbar-nav a[href="#tab_blocks"]').tab('show')
  $('.navbar-nav a[href="#tab_participants"]').tab('show')

}
