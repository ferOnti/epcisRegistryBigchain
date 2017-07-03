from bigchaindb_driver import BigchainDB
from bigchaindb_driver.crypto import generate_keypair
from time import sleep
from sys import exit

import mongoService
import pprint

alice, bob = generate_keypair(), generate_keypair()

bdb = BigchainDB('http://13.82.50.105:9984')


def saveEpcis( epcThing ):
    "save epcThing as an asset"
    epcid = epcThing["epcid"]
    pprint.pprint(epcid)
    print ("saveEpcis " + epcid)
    res = mongoService.getEpcisAsset( epcid )
    if res is None:
        print ("new")
        saveNewAsset(epcThing)
    else: 
        pprint.pprint (res)

    return

def saveNewAsset(epcThing):
    epcis_asset = {
        'data': epcThing
    }

    epcis_asset_metadata = {
        'action': 'creation'
    }

    prepared_creation_tx = bdb.transactions.prepare(
        operation='CREATE',
        signers=alice.public_key,
        asset=epcis_asset,
        metadata=epcis_asset_metadata
    )

    fulfilled_creation_tx = bdb.transactions.fulfill(
        prepared_creation_tx,
        private_keys=alice.private_key
    )

    sent_creation_tx = bdb.transactions.send(fulfilled_creation_tx)

    txid = fulfilled_creation_tx['id']
    print (txid)
    print (sent_creation_tx)

    trials = 0
    while trials < 60:
        trials += 1
        try:
            statuses = bdb.transactions.status(txid)
            print (str(trials) + " " + statuses.get('status'))
            if statuses.get('status') == 'valid':
                print('Tx valid in:', trials, 'secs')
                break
        except bigchaindb_driver.exceptions.NotFoundError:
            sleep(1)

    if trials == 60:
        print('Tx is still being processed... Bye!')
        exit(0)

    asset_id = txid
    print('Asset Id : ' + asset_id)

    return txid





