
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
        reloadNodeInfo()
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
        reloadNodeInfo()
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
    $.get("/crypto/config", function(data, status){
      console.log(data, status)
      $("#change-node-name").val(data.name)
      $("#change-node-host").val(data.host)
      $("#change-node-port").val(data.port)
    })
  })

  var btnChangeInfo = $('#btnChangeInfo')
  btnChangeInfo.on('click', function(event) {
    var modal = $(this)
    var nodeName = $('#change-node-name').val()
    var nodeHost = $('#change-node-host').val()
    var nodePort = $('#change-node-port').val()

    data = JSON.stringify({ name: nodeName, host: nodeHost, port: nodePort })
    
    $.ajax({
      url: "/crypto/rename",
      method: "POST",
      data: data,
      contentType: "application/json",
      processData: false,
      dataType: "json",
      success: function(data, status){
        reloadNodeInfo()
        $('#changeInfoDialog').modal('hide')
      },
      error: function(error, status){
        err = error.responseJSON
        $('#createAsset-statusbar').show()
        $('#createAsset-statusbar').html(err.message)
        console.error(err)
      }
    });

  })

  //getAssetDialog
  var dialog5 = $('#getAssetDialog').modal(options)

  dialog5.on('show.bs.modal', function(event) {
    var modal = $(this)
    $('#getAsset-statusbar').hide()
    $('#getAsset-statusbar').html("")
    $('#asset-result').hide()
    $('#asset-result').html("")
  })

  var btnGetAsset = $('#btnGetAsset')
  btnGetAsset.on('click', function(event) {
    var modal = $(this)
    var channelName = $('#selectChannel').val()
    var assetId     = $('#assetId').val()

    //sanitize
    assetId = assetId.replace(/[`~!@#$%^&*()_|\-?;:'",.<>\{\}\[\]\\]/gi, '')

    data = JSON.stringify({ channel: channelName, assetId: assetId })
    url = "/api/asset/" + assetId + "?channel="+channelName

    $.get(url, function(data) { 
        console.log("get")
        console.log(data)
        dataJson=JSON.stringify(data,null,4)
        result = hljs.highlightAuto(dataJson).value
    
        $('#asset-result').show()
        $('#asset-result').html(result)
      })
      .done(function(data) {
        console.log("done")
        console.log(data)
      })
      .fail(function(error) {
        console.log(error)
        err = error.responseJSON
        $('#getAsset-statusbar').show()
        $('#getAsset-statusbar').html(err.message)
        console.error(err)
      })
  })

  //createAssetDialog
  var dialog6 = $('#createAssetDialog').modal(options)

  dialog6.on('show.bs.modal', function(event) {
    var modal = $(this)
    $('#createAsset-statusbar').hide()
    $('#createAsset-statusbar').html("")
    $('#createAsset-result').hide()
    $('#createAsset-result').html("")

    assetData = { 
      type: "sample-asset",
      "name": "asset " + Math.round(Math.random()*10000+1000),
      "date" : new Date().toISOString()
    }
    $('#assetData').html(JSON.stringify(assetData, null, 4))
  })

  var btnCreateAsset = $('#btnCreateAsset')
  btnCreateAsset.on('click', function(event) {
    var modal = $(this)
    var channelName = $('#selectChannel').val()
    var assetData     = $('#assetData').val()

    data = JSON.stringify({ channel: channelName, assetData: assetData })
    
    $.ajax({
      url: "/api/asset",
      method: "POST",
      data: data,
      contentType: "application/json",
      processData: false,
      dataType: "json",
      success: function(data, status){
        dataJson=JSON.stringify(data,null,4)
        result = hljs.highlightAuto(dataJson).value
    
        $('#createAsset-result').show()
        $('#createAsset-result').html(result)
      },
      error: function(error, status){
        err = error.responseJSON
        $('#createAsset-statusbar').show()
        $('#createAsset-statusbar').html(err.message)
        console.error(err)
      }
    });

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

function reloadNodeInfo() {
  $.get("/crypto/config", function(data, status){

    var source   = $("#participants-template").html();
    var template = Handlebars.compile(source);
    $('#participantList').html(template(data))
    
    var source   = $("#channels-template").html();
    var template = Handlebars.compile(source);
    $('#channelList').html(template(data))

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

function getAsset(channel) {
  $('#getAssetDialog').modal('show')
  $('#assetChannelName').html(channel)

  $.get("/crypto/config", function(data, status){

    var source   = $("#channelcheckbox-template").html();
    var template = Handlebars.compile(source);
    $('#channelsCheckboxList').html(template(data))
  })

}

function createAsset(channel) {
  $('#createAssetDialog').modal('show')
  //$('#assetChannelName').html(channel)

  $.get("/crypto/config", function(data, status){

    var source   = $("#channelcheckbox-template").html();
    var template = Handlebars.compile(source);
    $('#channels2CheckboxList').html(template(data))
  })

}

window.onload = function() {
  initDialogs()
  
  //highlight scripts init
  hljs.initHighlightingOnLoad();

  reloadNodeInfo();
  getStats();

  setInterval(getStats, 4000)

  //$('.navbar-nav a[href="#tab_blocks"]').tab('show')
  $('.navbar-nav a[href="#tab_participants"]').tab('show')

}
