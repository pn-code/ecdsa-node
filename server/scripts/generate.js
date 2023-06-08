const { secp256k1 } = require("ethereum-cryptography/secp256k1.js");
const { keccak256 } = require("ethereum-cryptography/keccak.js");
const { toHex } = require("ethereum-cryptography/utils");

// Generate Keys
function generateKeys() {
  const privateKey = secp256k1.utils.randomPrivateKey();
  const publicKey = secp256k1.getPublicKey(privateKey);

  return { public: publicKey, private: privateKey };
}

// Get the Ethereum Address
function getAddress(publicKey) {
  return keccak256(publicKey.slice(1)).slice(-20);
}

const keys = generateKeys();
const address = getAddress(keys.public);

console.log("private key", toHex(keys.private));
console.log("public key", toHex(keys.public));
console.log("public address", toHex(address));
