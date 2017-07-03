
var Client = require('node-rest-client').Client;


var readThings = function (callback)
{
    vizixKey = config.vizix.key;
    vizixHost = config.vizix.host;
    vizixPort = config.vizix.port;
    mainThingTypeCode = config.packing_thing_type;
    subThingTypeCode = config.packing_thing_type;  //review !!

    var client = new Client( { "user":"root", "password":"root", "token":vizixKey } );

    // get thingtype code:
    args = {headers: { "Api_key": vizixKey } };

    vizixAddress = "http://" + vizixHost + ":" + vizixPort +
        "/riot-core-services/api/";

    thingType = vizixAddress + "thingType/?where=thingTypeCode%3D" + mainThingTypeCode;

    client.get(thingType, args, function (data, response) {
        // TODO : Validate the results
        id = data.results[0].id;

        thingsByThingTypeId = vizixAddress+"things/?where=thingTypeId%3D"+id+"&treeView=false"

        client.get(thingsByThingTypeId, args, function (data, response) {
                callback(data.results);
        });
    });

}
