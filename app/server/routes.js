
var mongoDB = null;
var exphbs = require('express-handlebars');
const WebSocket = require('ws');
const express = require("express");
const app = express();
const router = express.Router();

const http = require('http');
const url = require('url');

var wsService = require ("./wsService")
var server = http.createServer(app);
var wss = new WebSocket.Server({ server });

function returnError(res, message) {
    if (typeof message == "object") {
        console.error(message)
        res.status(500).json({error:true, message: "Internal Error"})
    } else {
        var err = {error:true, message: message}
        res.status(200).json(err)
    }
}

function init(webPort, websocketPort) {
    var path = rootpath + '/views/';
    var publicPath = rootpath + '/public';

    //handlebars
    let hbsOptions = {
        defaultLayout: 'main', 
        layoutsDir:  path + "/layouts/",
        partialsDir: path + "/partials/",
        extname: '.hbs'
    }
    app.engine('hbs', exphbs(hbsOptions));
    app.set('view engine', 'hbs');

    //app.set('views', path.join(__dirname, 'api/views/'));
    app.set('views', path);

    app.use(express.static(publicPath));

    var xmlparser = require('express-xml-bodyparser');

    var bodyParser = require('body-parser')
    app.use( bodyParser.json() );       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));
    app.use(xmlparser());


    //logging
    app.use(function (req, res, next) {
        console.log(req.method + " " + req.url);
        next();
    });

    //html pages
    router.get('/', function (req, res) {
        var params = []
        res.render('index', params );
    });

    //favicon
    router.get("/favicon.ico",function(req,res){
        res.sendFile(path + "public/favicon.ico");
    });

    app.get('/api/stats', function (req, res) {
        var mongoService = require("./mongoService");
        mongoService.getStats()
            .then((stats) => { res.json(stats)} )
    });

    app.get('/api/asset/:id', function (req, res) {
        var id = req.params.id

        var epcisService = require("./epcisService");
        epcisService.getAsset(id)
            .then((data) => { res.json(data)} )
            .catch((message) => {
                console.error(message)
                res.status(400).json({error:true, message: message})
            })

    });

    app.get('/api/assets', function (req, res) {
        var channel = req.query.channel
        var skip = req.query.skip

        var mongoService = require("./mongoService");
        mongoService.getAssetsList(channel, skip)
            .then((data) => { res.json(data)} )
            .catch((message) => {
                console.error(message)
                res.status(400).json({error:true, message: message})
            })

    });

    app.post('/api/asset', function (req, res) {
        var cryptoService = require("./cryptoService");
        var epcisService = require("./epcisService");

        var channel = req.body.channel;
        var assetDataStr = req.body.assetData;

        //todo: move this validation inside epcisService.postAsset
        try {
            assetData = JSON.parse(assetDataStr)
        } catch(message) {
            var err = {error:true, message: message}
            res.status(400).json(err)
            return
        }

        epcisService.postAsset(channel, assetData)
            .then((data) => { 
                console.log(data)
                res.json(data);
            })
            .catch((message) => {
                if (typeof message == "object") {
                    console.error(message)
                }
                var err = {error:true, message: message}
                res.status(400).json(err)
            })
    });

    app.post('/api/epcis/event', function (req, res) {
        var epcisService = require("./epcisService");
        epcisService.postEpcisEvent(req.headers.channel, req.body)
            .then((data) => { 
                res.json(data);
            })
            .catch((message) => {
                if (typeof message == "object") {
                    console.error(message)
                }
                var err = {error:true, message: message}
                res.status(400).json(err)
            })
            
    });

    app.get('/api/blocks', function (req, res) {
        var mongoService = require("./mongoService");
        mongoService.getBlockTimeList()
            .then((data) => { res.json(data)} )
            .catch((message) => {
                console.error(message)
                res.status(400).json({error:true, message: message})
            })

    });

    app.get('/api/sold', function (req, res) {
        var skip = req.query.skip

        var mongoService = require("./mongoService");
        mongoService.getSoldList(skip)
            .then((data) => { res.json(data)} )
            .catch((message) => {
                console.error(message)
                res.status(400).json({error:true, message: message})
            })

    });

    app.post('/api/epcid/provenance', function (req, res) {
        var epcid = req.body.epcid

        var epcisService = require("./epcisService");
        epcisService.getProvenance(epcid)
            .then((data) => { res.json(data)} )
            .catch((message) => {
                console.error(message)
                res.status(400).json({error:true, message: message})
            })

    });

    app.post('/api/stress/start', function (req, res) {
        var wsService = require("./wsService"); //todo: move stress test to another service?
        var stressTotal   = req.body.stressTotal;
        var stressBetween = req.body.stressBetween;

        wsService.testStart(stressTotal, stressBetween)
            .then((data) => { 
                res.json(data);
            })
            .catch((message) => {
                if (typeof message == "object") {
                    console.error(message)
                }
                var err = {error:true, message: message}
                res.status(400).json(err)
            })
            
    });


    //crypto api
    app.get('/crypto/config', function (req, res) {
        var cryptoService = require("./cryptoService");
        cryptoService.getPublicConfig()
            .then((data) => { 
                //console.log(data); 
                res.send(data);
            })
        
    });
    app.post('/crypto/remotenode', function(req, res) {
        var node = req.body.node;
        var publicKey = req.body.publicKey;

        var netService = require("./netService")
        netService.testRemoteNode(node, publicKey)
            .then((data) => {
                res.send(data)
            }) 
            .catch((message) => { returnError(res, message)})

    })

    app.get('/crypto/nodeinfo', function (req, res) {
        var cryptoService = require("./cryptoService");
        cryptoService.getNodeInfo()
            .then((data) => { 
                console.log(data); 
                res.send(data);
            })
        
    });

    app.get('/crypto/publickey', function (req, res) {
        var cryptoService = require("./cryptoService");
        cryptoService.getPublicKey()
            .then((data) => { 
                //console.log(data); 
                res.send(data);
            })
        
    });

    app.get('/crypto/channels', function (req, res) {
        var cryptoService = require("./cryptoService");
        cryptoService.getChannels()
            .then((data) => { 
                console.log(data); 
                res.json(data);
            })
        
    });

    app.get('/crypto/channel/:id', function (req, res) {
        var id = req.params.id
        var cryptoService = require("./cryptoService");
        cryptoService.getChannel(id)
            .then((data) => { 
                console.log(data); 
                res.json(data);
            })
        
    });

    app.delete('/crypto/channel/id', function (req, res) {
        var cryptoService = require("./cryptoService");
        cryptoService.deleteChannel(id)
            .then((data) => { 
                console.log(data); 
                res.json(data);
            })
        
    });

    app.post('/crypto/channel', function (req, res) {
        var cryptoService = require("./cryptoService");
        var participants = req.body.participants;
        var name = req.body.name;
        cryptoService.postChannel(name, participants)
            .then((data) => { 
                console.log(data); 
                res.json(data);
            })
            .catch((message) => {
                console.error(message)
                var err = {error:true, message: message}
                res.status(400).json(err)
            })        
    });

    app.post('/crypto/channel/remote', function (req, res) {
        var cryptoService = require("./cryptoService");
        var name      = req.body.name;
        var nonce     = req.body.nonce;
        var publicKey = req.body.publicKey
        var message   = req.body.message;

        cryptoService.postRemoteChannel(name, nonce, publicKey, message)
            .then((data) => { 
                //console.log(data); 
                res.json(data);
            })
            .catch((message) => {
                console.error(message)
                var err = {error:true, message: message}
                res.status(400).json(err)
            })
        
    });

    app.post('/crypto/rename', function (req, res) {
        var cryptoService = require("./cryptoService");
        var name = req.body.name;
        var host = req.body.host;
        var port = req.body.port;
        if (name == null || host == null || port == null) {
            return res.status(400).send("invalid data")
        }
        cryptoService.postRenameNode(name, host, port)
            .then((data) => { 
                res.json(data);
            })
    });

    app.get('/crypto/participants', function (req, res) {
        var cryptoService = require("./cryptoService");
        cryptoService.getParticipants()
            .then((data) => { 
                res.json(data);
            })
    });

    app.get('/crypto/participant/:id', function (req, res) {
        var cryptoService = require("./cryptoService");
        var id = req.params.id

        cryptoService.getParticipant(id)
            .then((data) => { 
                res.json(data);
            })
            .catch((error) => {res.status(400).send(error)})
    });

    app.delete('/crypto/participant/:id', function (req, res) {
        var cryptoService = require("./cryptoService");
        var id = req.params.id
        cryptoService.deleteParticipant(id)
            .then((data) => { 
                res.json(data);
            })
            .catch((error) => {res.status(200).send(error)})
    });

    app.post('/crypto/participant', function (req, res) {
        var cryptoService = require("./cryptoService");
        var signature = req.body.signature;
        var name = req.body.name;
        var host = req.body.host;
        var port = req.body.port;
        var publickey = req.body.publickey;

        if (signature!=null) {
            cryptoService.postSignature(signature)
                .then((data) => { 
                    res.json(data);
                })
                .catch((message) => {
                    var err = {error:true, message: message}
                    res.status(400).json(err)
                })

        } else {
            if (name == null || host == null || port == null || publickey == null) {
                return res.status(400).send("invalid data")
            }
            cryptoService.postParticipant(name, host, port, publickey)
                .then((data) => { 
                    res.json(data);
                })
                .catch((error) => {res.status(400).send(error)})
        }
    });

    app.delete('/crypto/participant/:id', function (req, res) {
        var cryptoService = require("./cryptoService");
        var id = req.params.id

        cryptoService.deleteParticipant(id)
            .then((data) => { 
                res.json(data);
            })
            .catch((error) => {res.status(400).send(error)})
    });

    app.use("/", router);

    app.use("*",function(req,res){
        console.log("    404:" );
        res.sendFile(path + "404.html");
    });
    app.listen(webPort, function() {
        console.log("Live at Port " + webPort);
    })

    /*
    //websocket server
    //todo: move to wsService 
    //const server = http.createServer(app);
    //const wss = new WebSocket.Server({ server });

    // Broadcast to all. 
    wss.broadcast = function broadcast(data) {
        console.log(wss.clients)
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    };
    wsService.setWss(wss)

    wss.on('connection', function connection(ws, req) {
        const location = url.parse(req.url, true);

        const ip = req.connection.remoteAddress
        const query = location.query
        const pathname = location.pathname

        ws.on('message', function incoming(message) {
            try {
                command = JSON.parse(message)
                if (typeof command.action != "undefined") {
                    wsDispatch(wss, ws, req, command)
                }
            } catch (err) { console.error(err)}
        });
    
        ws.send('{"message":"connected from ' + ip + '"}', function ack(err) {
            if (err) {
                console.error(err)
            }
        });
    });
 
    server.listen(websocketPort, function listening() {
        console.log('websocket open on %d', server.address().port);
    });
*/
}

var wsDispatch = function(wss, ws, req, command) {
    //var wsService = require ("./wsService")

    //wsService.wss = wss
    wsService.ws = ws
    wsService.req = req

    switch(command.action) {
        case "test-status" : wsService.testStatus()
            break
        case "start-test" : wsService.startTest(command)
            break;
        default:
            console.log("error command not defined " + command)    
    }
}

module.exports = {
    init: init,
}
