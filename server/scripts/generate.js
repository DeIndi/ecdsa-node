const crypto = require('crypto');

function generateKeyPair() {
    // Generate an elliptic curve key pair based on secp256k1 curve
    const keyPair = crypto.createECDH('secp256k1');
    keyPair.generateKeys();

    // Get the private key in hexadecimal format
    const privateKey = keyPair.getPrivateKey('hex');

    // Get the public key in hexadecimal format
    const publicKey = keyPair.getPublicKey('hex');

    return { privateKey, publicKey };
}

const { privateKey, publicKey } = generateKeyPair();
console.log("Private Key:", privateKey);
console.log("Public Key:", publicKey);