
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
    //var channelName = $('#selectChannel').val()
    var assetId     = $('#assetId').val()

    //sanitize
    assetId = assetId.replace(/[`~!@#$%^&*()_|\-?;:'",.<>\{\}\[\]\\]/gi, '')

    url = "/api/asset/" + assetId

    $.get(url, function(data) { 
        dataJson=JSON.stringify(data,null,4)
        result = hljs.highlightAuto(dataJson).value
    
        $('#asset-result').show()
        $('#asset-result').html(result)
        $('#getAsset-statusbar').hide()
      })
      .fail(function(error) {
        console.log(error)
        err = error.responseJSON
        $('#getAsset-statusbar').show()
        $('#getAsset-statusbar').html(err.message)
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
    $('#btnCreateAsset').show()

    var id = Math.round(Math.random()*100000+100000);
    assetData = { 
      "assetType": "sample-asset",
      "id": id,
      "name": "asset " + id,
      "date" : new Date().toISOString()
    }
    $('#assetData').html(JSON.stringify(assetData, null, 4))
  })

  var btnCreateAsset = $('#btnCreateAsset')
  btnCreateAsset.on('click', function(event) {
    var modal = $(this)
    var channelName = $('#selectChannel').val()
    var assetData     = $('#assetData').val()
    $('#btnCreateAsset').hide()

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

//general buttons

  var btnStressStart = $('#btnStressStart')
  btnStressStart.on('click', function(event) {
    var stressTotal   = $('#stressTotal').val()
    var stressBetween = $('#stressBetween').val()
    $('#btnStressStart').hide()
    $('#btnStressStop').hide()
    $('#stress-statusbar').hide()
    $('#stress-statusbar').html("")

    data = JSON.stringify({ stressTotal: stressTotal, stressBetween: stressBetween })
    
    $.ajax({
      url: "/api/stress/start",
      method: "POST",
      data: data,
      contentType: "application/json",
      processData: false,
      dataType: "json",
      success: function(data, status){
        //dataJson=JSON.stringify(data,null,4)
        //result = hljs.highlightAuto(dataJson).value
    
        //$('#createAsset-result').show()
        //$('#createAsset-result').html(result)
      },
      error: function(error, status){
        err = error.responseJSON
        $('#stress-statusbar').show()
        $('#stress-statusbar').html(err.message)
        console.error(err)
      }
    });

  })

} //initDialogs (and buttons)



var appendContractAddressToList_seen = {};
function appendContractAddressToList(contractAddress)
{
    var options = $("#contractsId");
    if (! appendContractAddressToList_seen[contractAddress]) {
        options.append($("<option />").val(contractAddress).text(contractAddress));
        appendContractAddressToList_seen[contractAddress] = true;
    }
}

function showInfoDialog(title, message, error) {
  $('#info-dialog-title').html(title)
  if (message && message != "") {
    $('#info-dialog-alert').show()
    $('#info-dialog-alert').html(message)
  } else {
    $('#info-dialog-alert').hide()
    $('#info-dialog-alert').html("")
  }
  if (error && error != "") {
    $('#info-dialog-error').show()
    $('#info-dialog-error').html(error)
  } else {
    $('#info-dialog-error').hide()
    $('#info-dialog-error').html("")
  }
  $('#infoDialog').modal('show')

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

function removeParticipant(nodeName) {
  showInfoDialog("remove participant", "processing...")
  //data = JSON.stringify({ node: node, publicKey: publicKey })
    
  $.ajax({
    url: "/crypto/participant/"+nodeName,
    method: "DELETE",
    //data: data,
    contentType: "application/json",
    //processData: false,
    //dataType: "json",
    success: function(data, status){
       showInfoDialog("remove participant", data.message);
       reloadNodeInfo()
    },
    error: function(error, status){
       showInfoDialog("remove participant",null, status.message);
      console.log(status)
    }
  });
}

function testConnection(node, publicKey) {
  showInfoDialog("test remote connection", "testing...")
  data = JSON.stringify({ node: node, publicKey: publicKey })
    
  $.ajax({
    url: "/crypto/remotenode",
    method: "POST",
    data: data,
    contentType: "application/json",
    processData: false,
    dataType: "json",
    success: function(data, status){
       showInfoDialog("test remote connection", data.message);
    },
    error: function(error, status){
       showInfoDialog("test remote connection",null, status.message);
      console.log(status)
    }
  });

}

function getStats() {
  $.get("/api/stats", function(data, status){

    totalBlocks = data.bigchain
    $('#totalBlocks').html(data.bigchain) 
    $('#totalVotes').html(data.votes) 
    $('#totalAssets').html(data.assets) 
    $('#totalTransactions').html(data.txs.total) 
    $('#totalCreate').html(data.txs.create) 
    $('#totalTransfer').html(data.txs.transfer) 
    $('#totalGenesis').html(data.txs.genesis) 
    $('#totalBacklog').html(data.backlog) 

    $.get("/api/blocks", function(data){
      BlCharts.update(data, totalBlocks);
    })

  });
}

function getAssets() {
  $.get("/api/assets", function(data, status){
    var source   = $("#assetsList-template").html();
    var template = Handlebars.compile(source);
    $('#tbody-assets').html(template({assets:data}))
  });
}

function getAsset(channel) {
  $('#getAssetDialog').modal('show')
  
  //$.get("/crypto/config", function(data, status){

  //  var source   = $("#channelcheckbox-template").html();
  //  var template = Handlebars.compile(source);
    //$('#channelsCheckboxList').html(template(data))
    //$('#channelsCheckboxList select').val(channel)
  //})

}

function createAsset(channel) {
  $('#createAssetDialog').modal('show')
  //$('#assetChannelName').html(channel)

  $.get("/crypto/config", function(data, status){

    var source   = $("#channelcheckbox-template").html();
    var template = Handlebars.compile(source);
    $('#channels2CheckboxList').html(template(data))
    $('#channels2CheckboxList select').val(channel)
  })

}

function getSold() {
  $.get("/api/sold", function(data, status){
    var source   = $("#soldList-template").html();
    var template = Handlebars.compile(source);
    $('#tbody-sold').html(template({epcisList:data}))
  });
}

function epcidNav(epcid) {
  $('#sold-result').html(epcid)

  var data = '{"epcid": "' + epcid + '"}'

  $.ajax({
    url: "/api/epcid/provenance",
    method: "POST",
    data: data,
    contentType: "application/json",
    processData: false,
    dataType: "json",
    success: function(data, status){
      console.log(data)
      console.log(JSON.stringify(data))
      $('#sold-result').html(JSON.stringify(data, null, 2))
    },
    error: function(error, status){
      console.log(error)
      $('#sold-result').html(error.statusText)
    }
  });

}

window.onload = function() {
  //initDialogs()
  
  //highlight scripts init
  hljs.initHighlightingOnLoad();

  //reloadNodeInfo();
  //getStats();
  //getAssets();

  //getSold();
  //setInterval(getStats, 4000)

  //BlCharts.init();
  //ChainWebSocket.initialize()

  $('.navbar-nav a[href="#tab_visibility"]').tab('show')
  //$('.navbar-nav a[href="#tab_navigator"]').tab('show')
  //$('.navbar-nav a[href="#tab_blocks"]').tab('show')
  //$('.navbar-nav a[href="#tab_participants"]').tab('show')

}
