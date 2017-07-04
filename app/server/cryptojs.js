
const crypto    = require('crypto');
const algorithm = 'aes-256-ctr';
const password  = 'd77c0d46ae188164391f67b5d8eb3883';


function encrypt(text){
    var cipher  = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text){
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}

function getHash() {
    var hash = crypto.createHash('sha256');
    return hash;
}

function getDiffieHellman() {
    //var crypto = require('crypto');
    var diffieHellman = crypto.createDiffieHellman(password, 'hex');
    return diffieHellman;
}

function encryptMessage(secret, plain) {
    var cipher  = crypto.createCipher(algorithm, secret)
    var crypted = cipher.update(plain,'utf8','hex')
    console.log(crypted)
    crypted += cipher.final('hex');
    return crypted;
}

function decryptMessage(secret, text) {
    var decipher = crypto.createDecipher(algorithm, secret)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    getDiffieHellman: getDiffieHellman,
    getHash: getHash,
    encryptMessage: encryptMessage,
    decryptMessage: decryptMessage,
}
