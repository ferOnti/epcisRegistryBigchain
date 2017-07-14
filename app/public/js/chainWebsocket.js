"use strict";

var ChainWebSocket = {};

ChainWebSocket.socket = null;
ChainWebSocket.testRunning = false
ChainWebSocket.testMoreMessages = false
ChainWebSocket.testMessagesSent  = 0
ChainWebSocket.testMessagesTotal  = 0
ChainWebSocket.testDelayBetween  = 0


ChainWebSocket.connect = (function(host) {
    if ('WebSocket' in window) {
        ChainWebSocket.socket = new WebSocket(host);
    } else if ('MozWebSocket' in window) {
        ChainWebSocket.socket = new MozWebSocket(host);
    } else {
        console.log('Error: WebSocket is not supported by this browser.');
        return;
    }

    ChainWebSocket.socket.onopen = function () {
        console.log('Info: WebSocket connection opened.');

        var firstCommand = {"action": "test-status"}
        ChainWebSocket.sendMessage(JSON.stringify(firstCommand));
    };

    ChainWebSocket.socket.onclose = function () {
        console.log('Info: WebSocket closed.');
    };

    ChainWebSocket.socket.onmessage = function (message) {
        if (message.data) {
            try {
                var obj = JSON.parse(message.data);
                if (typeof obj.action != "undefined") {
                    ChainWebSocket.dispatch(obj)
                }

                if (obj.action && obj.action == "updateBlinks") {
                    ChainWebSocket.demoblinksTimes++;
                    var status;
                    if (obj.blinksToSend == 0) {
                        status = obj.blinksSent + " blinks sent successfully";
                    } else {
                        var total = (1 * obj.blinksToSend) + (1 * obj.blinksSent);
                        status = "sending " + obj.blinksSent + " of " + total + " blinks";
                    }
                    $("#blinksStatus").html(status);

                    if (ChainWebSocket.preserveLogs) {
                        $("#demo-blinks").html($("#demo-blinks").html()  + "<br>" +  hljs.highlightAuto(obj.message).value);
                    } else {
                        $("#demo-blinks").html(hljs.highlightAuto(obj.message).value);
                    }
                    $("#demoblinksTimes").html(ChainWebSocket.demoblinksTimes);
                }

                if (obj.action && obj.action == "updateCoreBridge") {
                    ChainWebSocket.corebridgeTimes++;
                    if (ChainWebSocket.preserveLogs) {
                        $("#corebridge-output").html($("#corebridge-output").html()  + "<br>" +  hljs.highlightAuto(obj.message).value);
                    } else {
                        $("#corebridge-output").html(hljs.highlightAuto(obj.message).value);
                    }
                    $("#corebridgeTimes").html(ChainWebSocket.corebridgeTimes);
                }

                if (obj.action && obj.action == "updateEpcisOutbound") {
                    ChainWebSocket.epcisoutboundTimes++;
                    if (ChainWebSocket.preserveLogs) {
                        $("#epcis-outbound").html($("#epcis-outbound").html()  + "<br><br>" +  hljs.highlightAuto(obj.message).value);
                    } else {
                        $("#epcis-outbound").html(hljs.highlightAuto(obj.message).value);
                    }
                    $("#epcisoutboundTimes").html(ChainWebSocket.epcisoutboundTimes);
                }

                if (obj.action && obj.action == "epcisInboundMessage") {
                    ChainWebSocket.epcisinboundTimes++;
                    if (ChainWebSocket.preserveLogs) {
                        $("#epcis-inbound").html($("#epcis-inbound").html()  + "<br>" +  hljs.highlightAuto(obj.message).value);
                    } else {
                        $("#epcis-inbound").html(hljs.highlightAuto(obj.message).value);
                    }
                    $("#epcisinboundTimes").html(ChainWebSocket.epcisinboundTimes);
                }

                if (obj.action && obj.action == "ethereumStats") {
                    $("#epcisRegistryAddress").html(obj.epcisRegistryAddress);
                    $("#ethCoinbase").html(obj.ethCoinbase);
                    $("#ethGasPrice").html(obj.ethGasPrice);
                    $("#netPeerCount").html(obj.netPeerCount);
                    $("#ethProtocolVersion").html(obj.ethProtocolVersion);
                    $("#pendingTxs").html(obj.pendingTxs);
                    $("#queuedTxs").html(obj.queuedTxs);
                    $("#ethBlockNumber").html(obj.ethBlockNumber);
                    $("#ethMining").html(obj.ethMining);
                    $("#ethHashrate").html(obj.ethHashrate);
                    $("#clientVersion").html(obj.clientVersion);
                    $("#ethSyncing").html(obj.ethSyncing);
                    $("#ethereumUrl").html(obj.ethereumUrl);
                    if (typeof obj.thingsLength != "undefined") {
                        $("#thingsLength").html(obj.thingsLength);
                        $("#eventsLength").html(obj.eventsLength);
                        $('#rangeThings').html("(1-" + obj.thingsLength + ")");
                        $("#vocsLength").html(obj.vocsLength);
                        $("#customFieldsLength").html(obj.customFieldsLength);
                    }

                    if (typeof obj.quorumcanVote != "undefined") {
                        $("#quorum-maxblocktime").html(obj.quorummaxblocktime);
                        $("#quorum-minblocktime").html(obj.quorumminblocktime);
                        $("#quorum-status").html(obj.quorumstatus);
                        $("#quorum-type").html(obj.quorumtype);
                        $("#quorum-canCreateBlocks").html(obj.quorumcanCreateBlocks);
                        $("#quorum-canVote").html(obj.quorumcanVote);
                        $("#quorum-voteAccount").html(obj.quorumvoteAccount);
                        $("#quorum-blockMakerAccount").html(obj.quorumblockMakerAccount);
                        $("#quorum-privateKey").html(obj.quorumprivateKey);
                        
                    }
                    $('#tableAccountsBalance').find('tbody').empty()
                    $.each(obj.accounts, function(k, v) {
                        var myRow = "<tr><td>" + k + "</td><td>" + v + "</td></tr>";
                        $('#tableAccountsBalance').find('tbody').append(myRow);
                    });

                    if (typeof obj.blocks != "undefined") {
                        BlCharts.updateBlocks(obj.blocks);
                    }
                }

            } catch (e) {
                console.log (e);
            }
        } else {
            console.log(message);
        }
    };
});

ChainWebSocket.dispatch = function (message) {
    if (message.action == "test-status") {
        ChainWebSocket.testRunning      = message.testRunning
        ChainWebSocket.testMoreMessages = message.testMoreMessages
        ChainWebSocket.testMessagesSent = message.testMessagesSent
        ChainWebSocket.testMessagesTotal= message.testMessagesTotal
        ChainWebSocket.testDelayBetween = message.testDelayBetween

        $("#stressStatus").html("sent "+ message.testMessagesSent + " of " + 
            message.testMessagesTotal + " messages")

        $("#stress-statusbar").hide()
        if (message.testRunning) {
            $("#btnStressStart").hide()
            $("#stressForm").hide()
            $("#stressPanel").show()
            $("#btnStressStop").show()

        } else {
            $("#btnStressStart").show()
            $("#stressForm").show()
            $("#stressPanel").hide()
            $("#btnStressStop").hide()
        }
        $("#blinksStatus").html(status);

    }

}

ChainWebSocket.initialize = function() {
    var websocketPort = parseInt(window.location.port) + 1

    if (window.location.protocol == 'http:') {
        ChainWebSocket.connect('ws://' + window.location.hostname + ':' + websocketPort + '/');
    } else {
        ChainWebSocket.connect('wss://' + window.location.hostname + ':' + websocketPort + '/');
    }
};

ChainWebSocket.sendMessage = function( message) {
    if (message != '') {
        ChainWebSocket.socket.send(message);
        //console.log(message);
    }
};




