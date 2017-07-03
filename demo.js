epcisService = require('./epcisService')

//var epcid = 'urn:epcid:00' + Math.round((Math.random(0)*1000)+1000)
var epcid = 'urn_epcid_00' + Math.round((Math.random(0)*1000)+1000)
var epcisAsset = { 
    epcid: epcid, 
    temperature: 11, 
    datetime: new Date().toString() 
};


//res = epcisService.postEpcisAsset(epcisAsset)
//console.log(res)

epcisService.postEpcisAsset(epcisAsset)
    .then (() => { return epcisService.getEpcisAsset("urn_epcid_001569")} )
    .then( console.log)
