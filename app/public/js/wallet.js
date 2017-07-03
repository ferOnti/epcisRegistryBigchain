var Client = require('node-rest-client').Client;
var client = null;
var baseUrl = null;

var config = {};

var currentUser = {
    valid: false,
    address: "?",
    password: ""  //terrible security, storing private key in client memory,
                  //just for demo
};

var global_contract_status = "--";

function clearStatusBar()
{
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

function enableDisablePanels(addressInfo)
{
    var m = addressInfo;
    var status = global_contract_status;
    console.log("[["+status+"]]");
    if ( (m._shipperAddress == currentUser.address) && (status == "ISSUED") ) {
        $("#ShipperPanel").removeClass("disabled");
        $("#button_shipper").prop("disabled", false);
    } else {
        $("#ShipperPanel").addClass("disabled");
        $("#button_shipper").prop("disabled", true);
    }
    if ((m._transportAddress == currentUser.address) && (status == "SLAC"))  {
        $("#TransportPanel").removeClass("disabled");
        $("#button_transport").prop("disabled", false);
    } else {
        $("#TransportPanel").addClass("disabled");
        $("#button_transport").prop("disabled", true);
    }
    if ((m._portAddress == currentUser.address) && (status == "RECEIVED") ) {
        $("#PortPanel").removeClass("disabled");
        $("#button_port").prop("disabled", false);
    } else {
        $("#PortPanel").addClass("disabled");
        $("#button_port").prop("disabled", true);
    }
    if ((m._customsAddress == currentUser.address) && (status == "ON_TRANSIT") ) {
        $("#CustomsPanel").removeClass("disabled");
        $("#button_customs").prop("disabled", false);
    } else {
        $("#CustomsPanel").addClass("disabled");
        $("#button_customs").prop("disabled", true);
    }
    /*console.log(JSON.stringify(m));
    console.log(currentUser.address);*/
    
    if (m._shipperAddress == currentUser.address) {
        if (status == "ISSUED") {
            $("#shipper_button_msg").text("");
        } else {
            $("#shipper_button_msg").text("Signed");
        }
    } else {
        if (status == "ISSUED") {
            $("#shipper_button_msg").text("No Permission");
        } else {
            $("#shipper_button_msg").text("Signed");
        }
    }
    if (m._transportAddress == currentUser.address) {
        if (status == "ISSUED") {
            $("#transport_button_msg").text("Pending");
        } else if (status == "SLAC") {
            $("#transport_button_msg").text("");
        } else {
            $("#transport_button_msg").text("Signed");
        }
    } else {
        if (status == "ISSUED") {
            $("#transport_button_msg").text("Pending");
        } else if (status == "SLAC") {
            $("#transport_button_msg").text("No Permission");
        } else {
            $("#transport_button_msg").text("Signed");
        }
    }
    if (m._portAddress == currentUser.address) {
        if ( (status == "ISSUED") || (status == "SLAC") ) {
            $("#port_button_msg").text("Pending");
        } else if (status == "RECEIVED") {
            $("#port_button_msg").text("");
        } else {
            $("#port_button_msg").text("Signed");
        }
    } else {
        if ( (status == "ISSUED") || (status == "SLAC") ) {
            $("#port_button_msg").text("Pending");
        } else if (status == "RECEIVED") {
            $("#port_button_msg").text("No Permission");
        } else {
            $("#port_button_msg").text("Signed");
        }
    }
    if (m._customsAddress == currentUser.address) {
        if ( (status == "ISSUED") || (status == "SLAC") || (status == "RECEIVED") ) {
            $("#customs_button_msg").text("Pending");
        } else if (status == "ON_TRANSIT") {
            $("#customs_button_msg").text("");
        } else {
            $("#customs_button_msg").text("Signed");
        }
    } else {
        if ( (status == "ISSUED") || (status == "SLAC") || (status == "RECEIVED") ) {
            $("#customs_button_msg").text("Pending");
        } else if (status == "ON_TRANSIT") {
            $("#customs_button_msg").text("No Permission");
        } else {
            $("#customs_button_msg").text("Signed");
        }
    }    
}

function disableAllPanels()
{
    $("#ShipperPanel").addClass("disabled");
    $("#TransportPanel").addClass("disabled");
    $("#PortPanel").addClass("disabled");
    $("#CustomsPanel").addClass("disabled");
}


function authenticateWallet()
{
    var user = $("#wallet_user").val();
    var pw = $("#wallet_password").val();
    setStatusBar("info", "Validating account credentials...");
    var req = { walletUser: user, walletPassword:pw };
    console.log(req);
    currentUser.valid = false;
    disableAllPanels();
    $.ajax({
        url: baseUrl + "validate_user",
        type: "POST",
        data: req,
        timeout: 300000
    }).done(function(data) {
        console.log(data);
        setStatusBar("success", "User validated: [" + data.address+"]");
        currentUser.valid = true;
        currentUser.address = data.address;
        currentUser.password = pw;
        fetchUserContracts();
        getInfoContract();
        $("#username").html(user);
        $('.navbar-nav a[href="#tab_contracts"]').tab('show')
    }).fail(function(error) {
        var s = "error " + JSON.stringify(error);
        setStatusBar("danger", "User not found.");
    });
}


function getInfoContract() {
    var contractAddr =  $("#contractsId").val();
    if (contractAddr == "" || contractAddr == null || typeof(contractAddr) === "undefined") {
        $("#serialView").html("--");
        $("#ConsigneeView").html("--");
        $("#ConsigneeBankView").html("--");
        $("#PackageTagView").html("--");
        $("#ShipperView").html("--");
        $("#contractStatus").html("--");
        $('#packingItemTableBody').html("<tr><td>--</td></tr>");
    } else {
        client.get(baseUrl + "contractinfo/"+contractAddr, {}, function (m, response) {
            $("#serialView").html( m._serial );
            $("#ConsigneeView").html( m._Consignee );
            $("#ConsigneeBankView").html( m._ConsigneeBank );
            $("#PackageTagView").html( m._PackageTag  );
            $("#ShipperView").html( m._Shipper );
            var status = m.contractStatus;
            global_contract_status = status;
            if (status == "ISSUED") {
                status = "0 - ISSUED";
            } else if (status == "SLAC") {
                status = "1 - SLAC";
            } else if (status == "RECEIVED") {
                status = "2 - RECEIVED";
            } else if (status == "ON_TRANSIT") {
                status = "3 - ON_TRANSIT"; 
            } else if (status == "CLEARED") {
                status = "4 - CLEARED";
            }
            $("#contractStatus").html(status);
            var children = m.PackingItems;
            var rows = "";
            if ( (typeof(children) === "undefined") || (children.length == 0) ) {
                rows = "<tr><td>No entries</td><td></td><td></td></tr>";
            } else {
                for (var j = 0; j < children.length; j++) {
                    var it = children[j];
                    //console.log(it);
                    var row = '<tr>';
                    row = row + "<td>" + (j+1) +"</td>";
                    row = row + "<td>" + it.name + "</td>";
                    //row = row + "<td>" + it.serial + "</td>";
                    if (typeof(it.PartNumber) !== "undefined") {
                        row = row + "<td>" + it.PartNumber + "</td>";
                    } else {
                        row = row + "<td></td>";
                    }
                    row = row + "</tr>";
                    rows = rows + row;
                }
            }
            $('#packingItemTableBody').html(rows);
            enableDisablePanels(m.addressInfo);
            var m = m.addressInfo;
            
            client.get(baseUrl + "accounts", {}, function (data, response) {
                function getAddressName(addr) {
                    for (n in data.roleAccounts) {
                        if (data.roleAccounts[n].address == addr) {
                            return n + " ";
                        }
                    }
                    return "";
                }
                
                var addr = '';
                addr = m._shipperAddress;
                $("#ShipperAddressView").text( getAddressName(addr) + addr);
                addr = m._transportAddress;
                $("#TransportAddressView").text( getAddressName(addr) + addr);
                addr = m._portAddress;
                $("#PortAuthorityAddressView").text( getAddressName(addr) + addr);
                addr = m._customsAddress;
                $("#CustomsAuthorityAddressView").text( getAddressName(addr) + addr);                
            });            
        });
    }
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
      $.each(contracts, function() {
          appendContractAddressToList(this);
      });
      setTimeout(getInfoContract,100);

    } else {
      setStatusBar("warning", "There are zero contracts");
    }
  });
}

function fetchUserContracts()
{
    if (! currentUser.valid) {
        return;
    }
    $("#contractsId").empty();
    appendContractAddressToList_seen = {};
    getContractsAddrFromAccount(currentUser.address);

}


function send_eSign_simple(methodName, nice)
{
  if (! currentUser.valid) {
      setStatusBar("danger", "Not authenticated" );
      return;
  }

  var contractAddr =  $("#contractsId").val();
  setStatusBar("info", "Sent "+nice+" for contract " + contractAddr + "..." );

  $.ajax({
        url: baseUrl + methodName + "/"+contractAddr,
        type: "POST",
        data: {fromAccount: currentUser},
        timeout: 300000
  }).done(function(data) {
        if (data.error) {
            setStatusBar("info", nice + " : " + data.error);
        } else {
            getInfoContract();
            setStatusBar("info", nice + " : Ok");
        }
  }).fail(function(error) {
    if (error.status == 403) {
        setStatusBar("danger", "Failed to esign: 403 - Forbidden");
    } else {
        var s = "error " + JSON.stringify(error);
        setStatusBar("danger", "Failed to esign: Internal server error.");
    }
  });
}


function set_eSign_CustomsAuth() {
  send_eSign_simple("esign_customs", "esign_customs");
}

function set_eSign_PortAuth() {
  send_eSign_simple("esign_port", "esign_port");
}

function set_eSign_Shipper() {
  send_eSign_simple("esign_shipper", "esign_supplier");
}

function set_eSign_Transport() {
  if (! currentUser.valid) {
      setStatusBar("danger", "Not authenticated" );
      return;
  }
  var tag = $('#PackageTag2').val();
  var contractAddr =  $("#contractsId").val();

  setStatusBar("info", "Sent esign_carrier for contract " + contractAddr + "..." );
  $.ajax({
        url: baseUrl + "esign_transport/"+contractAddr+"/"+tag,
        type: "POST",
        data: {fromAccount: currentUser},
        timeout: 300000
  }).done(function(data) {
        if (data.error) {
            setStatusBar("info", "esign_carrier : " + data.error);
        } else {
            getInfoContract();
            setStatusBar("info", "esign_carrier : Ok");
        }
  }).fail(function(error) {
    if (error.status == 403) {
        setStatusBar("danger", "Failed to esign: 403 - Forbidden");
    } else {
        var s = "error " + JSON.stringify(error);
        setStatusBar("danger", "Failed to esign: Internal server error.");
    }
  });
}


window.onload = function() {
    function onPress(e) {
      if(e.keyCode==13) {
          $('#authbtn').click();
          return false;
      }
    }
    $('#wallet_user').keypress(onPress);
    $('#wallet_password').keypress(onPress);
    
    client = new Client();
    baseUrl = window.location.href;
    for (var i = baseUrl.length - 1; i >= 0; i--) {
        if (baseUrl[i] == '/') {
            baseUrl = baseUrl.substring(0,i+1);
            break;
        }
    }
    disableAllPanels();
}
