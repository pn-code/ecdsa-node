const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { Point } = require("ethereum-cryptography/secp256k1");

app.use(cors());
app.use(express.json());

const balances = {
  "42aade8beea8ca9b2c407e8caa3f6297a1061750e36b303fe6e339a660493cde": 100,
  b60182abaa252ccc39d18735ccdbcbe17b7cc50fab74579ed0be3c68dd17342e: 50,
  "748ca71a1d8903c0798e86380fbfb5ba10ff539d71f842426b924020c7b0c5a8": 75,
};

const publicKeys = {
  "03dbbbb341610f50980cc711a6230c540090cef1ce9a8f4b71252e2c930f5adbfd": 1,
  "03deb35788ef9aa66f9612cf58dc192232669c15307782cfc963bc920e7dc2ed83": 1,
  "03ca56de970338441acf757ca60c89bbaacc692583ff26f233ca0593f5094b6d13": 1,
};

app.get("/balance/:privateKey", (req, res) => {
  const { privateKey } = req.params;
  const balance = balances[privateKey] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, signature } = req.body;

  // Convert signature r, s back to BigInt
  const r = BigInt(signature.r);
  const s = BigInt(signature.s);

  // Get the public key
  const hashedData = hashData(sender, recipient, amount);
  const rebuildSignature = new secp256k1.Signature(r, s);
  rebuildSignature.recovery = signature.recovery;

  const publicKey = rebuildSignature.recoverPublicKey(hashedData).toHex();

  if (!publicKeys[publicKey]) {
    res.status(403).send({ message: "Forbidden" });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function hashData(sender, recipient, amount) {
  const data = utf8ToBytes(sender + recipient + amount);
  return keccak256(data);
}
