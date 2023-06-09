import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { utf8ToBytes } from "ethereum-cryptography/utils.js";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  // Hash Data
  function hashData() {
    const data = utf8ToBytes(privateKey + recipient + sendAmount);
    return keccak256(data);
  }

  // Signing the Hash
  async function signData() {
    const hashedData = hashData();
    const signature = secp256k1.sign(hashedData, privateKey);
    return signature;
  }

  async function transfer(evt) {
    evt.preventDefault();

    const signature = await signData();
    signature.r = signature.r.toString();
    signature.s = signature.s.toString();

    try {
      const { data } = await server.post(`/send`, {
        signature: signature,
        sender: privateKey,
        amount: parseInt(sendAmount),
        recipient,
      });
      setBalance(data.balance);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
