
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

    //send the index.html view
    router.get('/', function (req, res) {
        res.sendFile(path + "index.html");
    });

    //returns favicon
    router.get("/favicon.ico",function(req,res){
        res.sendFile(path + "public/favicon.ico");
    });

    app.get('/api/parties', function (req, res) {
        var mongoService = require("./mongoService");

        mongoService.getParties()
            .then((parties) => {res.json(parties)} )
    });

    app.get('/api/stats', function (req, res) {
        var mongoService = require("./mongoService");

        mongoService.getStats()
            .then((stats) => { console.log(stats); res.json(stats)} )
    });

    app.get('/getContracts', function (req, res) {
        var permissions = require("./permissions");

        permissions.getContracts(mongoDB, function(contracts){
            res.json(contracts);
        });
    });

    app.get('/getMainAccount', function (req, res) {
        var permissions = require("./permissions");
        var hostname = req.headers.host;

        permissions.createMainAccount(mongoDB, hostname, function(mainAccount){
            res.json(mainAccount);
        });
    });

    app.get('/newAccount', function (req, res) {
        var permissions = require("./permissions");
        var hostname = req.headers.host;

        permissions.newAccount(mongoDB, hostname, function(account){
            res.json(account);
        });
    });

    app.get('/newContract', function (req, res) {
        var permissions = require("./permissions");
        var mainId = req.query.mainId;
        permissions.newContract(mongoDB, mainId, function(contract){
            res.json(contract);
        });
    });

    app.post('/updateMainAccount', function (req, res) {
        var permissions = require("./permissions");
        var id   = req.body.id;
        var name = req.body.name;
        var hostname = req.body.hostname;
        var data = {_id: id, name: name, hostname: hostname};
        permissions.updateMainAccount(mongoDB, data, function(account){
            res.json(account);
        });
    });

    app.get('/cleanDatabase', function (req, res) {
        var permissions = require("./permissions");
        permissions.cleanDatabase(mongoDB, function(result){
            res.json(result);
        });
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
