from bigchaindb_driver import BigchainDB
from bigchaindb_driver.crypto import generate_keypair
from time import sleep
from sys import exit

import time;
import random;

alice, bob = generate_keypair(), generate_keypair()

bdb = BigchainDB('http://13.82.50.105:9984')

localtime = time.asctime( time.localtime(time.time()) )
print ("Local current time :" + localtime)

epcidnr = random.randrange(1000,9999)
epcis_asset = {
    'data': {
        'thing': {
            'epcid': 'urn:epcid:00' + str(epcidnr),
            'eventTime': localtime,
            'bizStep': 'receiving',
            'disposition': 'in_progress',
            'bizLocation': 'location1'
        },
    },
}

print (epcis_asset)

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

transfer_asset = {
    'id': asset_id
}

output_index = 0
output = fulfilled_creation_tx['outputs'][output_index]

transfer_input = {
    'fulfillment': output['condition']['details'],
    'fulfills': {
        'output': output_index,
        'transaction_id': fulfilled_creation_tx['id']
    },
    'owners_before': output['public_keys']
}

epcis_transfer1_metadata = {
    'action': 'transfer self',
    'date' : time.asctime( time.localtime(time.time()) )
}

prepared_transfer_tx = bdb.transactions.prepare(
    operation='TRANSFER',
    asset=transfer_asset,
    inputs=transfer_input,
    recipients=alice.public_key,
    metadata=epcis_transfer1_metadata
)

fulfilled_transfer_tx = bdb.transactions.fulfill(
    prepared_transfer_tx,
    private_keys=alice.private_key,
)

sent_transfer_tx = bdb.transactions.send(fulfilled_transfer_tx)
print (sent_transfer_tx)
sleep(2)

#second transfer

epcis_transfer2_metadata = {
    'action': 'transfer to bob',
    'date' : time.asctime( time.localtime(time.time()) )
}

prepared_transfer_tx2 = bdb.transactions.prepare(
    operation='TRANSFER',
    asset=transfer_asset,
    inputs=transfer_input,
    recipients=bob.public_key,
    metadata=epcis_transfer2_metadata
)

fulfilled_transfer_tx2 = bdb.transactions.fulfill(
    prepared_transfer_tx2,
    private_keys=alice.private_key,
)

sent_transfer_tx = bdb.transactions.send(fulfilled_transfer_tx2)

print("Is Bob the owner?",
    sent_transfer_tx['outputs'][0]['public_keys'][0] == bob.public_key)

print("Was Alice the previous owner?",
    fulfilled_transfer_tx2['inputs'][0]['owners_before'][0] == alice.public_key)

