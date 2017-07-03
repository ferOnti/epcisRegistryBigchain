config = require('./config.bulk.json');
epcisService = require('./epcisService')

var filename= config.output
var count = 0
var skip = config.start

var sleep = require('sleep');

//var request = require('then-request');
var request = require('sync-request');

LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader(filename);

lr.on('error', function (err) {
	// 'err' contains error object
    console.log(err)
});

lr.on('line', function (line) {
    count ++
    if (skip > count) { return }
    console.log("=============== " + count)
    lr.pause()
    epcisService.processLine(line)
        //.then(() => {console.log("bulk.js - processline ")} )
        //.then(sleep.msleep( config.sleep))
        .then(() => {
            //console.log("bulk.js - processline - ")
            //sleep.msleep( config.sleep)
            //console.log("bulk.js - processline - end ")
            lr.resume()
        } )
});

lr.on('end', function () {
	// All lines are read, file is closed now.
});





