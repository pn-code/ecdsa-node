import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { toHex } from "ethereum-cryptography/utils.js";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
  function getAddress(publicKey) {
    return keccak256(publicKey.slice(1)).slice(-20);
  }

  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    if (privateKey) {
      const {
        data: { balance },
      } = await server.get(`balance/${privateKey}`);
      setBalance(balance);

      const publicKey = secp256k1.getPublicKey(privateKey);
      const address = getAddress(publicKey);
      setAddress(toHex(address));
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input
          placeholder="Type private key"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>

      <section>
        <h2 style={{ fontSize: "14px", fontWeight: 400 }}>Address</h2>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 400,
            paddingInline: "12px",
            paddingBlock: "8px",
            background: "#E5E8E8",
            color: "black"
          }}
        >
          {address}
        </p>
      </section>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
