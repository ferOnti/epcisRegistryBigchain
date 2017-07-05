
var mongoDB = null;

function init(express, app, router) {
    var path = rootpath + '/views/';
    var publicPath = rootpath + '/public';

    app.use(express.static(publicPath));

    var bodyParser = require('body-parser')
    app.use( bodyParser.json() );       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));

    //logging
    app.use(function (req, res, next) {
        console.log(req.method + " " + req.url);
        next();
    });

    //html pages
    router.get('/', function (req, res) {
        res.sendFile(path + "index.html");
    });

    //favicon
    router.get("/favicon.ico",function(req,res){
        res.sendFile(path + "public/favicon.ico");
    });

    //api
    //app.get('/api/parties', function (req, res) {
    //    var mongoService = require("./mongoService");
    //    mongoService.getParties()
    //        .then((parties) => {res.json(parties)} )
    //});

    app.get('/api/stats', function (req, res) {
        var mongoService = require("./mongoService");
        mongoService.getStats()
            .then((stats) => { console.log(stats); res.json(stats)} )
    });

    //crypto api
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
        //var id   = req.body.id;
        //var name = req.body.name;
        cryptoService.postChannel()
            .then((data) => { 
                console.log(data); 
                res.json(data);
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

    app.post('/crypto/participant', function (req, res) {
        var cryptoService = require("./cryptoService");
        var name = req.body.name;
        var host = req.body.host;
        var port = req.body.port;
        var publickey = req.body.publickey;
        if (name == null || host == null || port == null || publickey == null) {
            return res.status(400).send("invalid data")
        }
        cryptoService.postParticipant(name, host, port, publickey)
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
            .catch((error) => {res.status(400).send(error)})
    });

    app.use("/", router);

    app.use("*",function(req,res){
        console.log("    404:" );
        res.sendFile(path + "404.html");
    });

}

module.exports = {
    init: init,
}
