import pymongo
import pprint

from pymongo import MongoClient

client = MongoClient('mongodb://13.82.50.105:27017')

db = client['bigchain']


def getEpcisAsset( epcid ):
    "gets an asset from mongodb database"

    collection = db['assets']
    criteria = {
        "data.epcid": epcid
    }

    res = collection.find_one(criteria)
    #pprint.pprint(res)
    return res


