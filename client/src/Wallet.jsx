import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1-compat"
import { hexToBytes, bytesToHex } from 'ethereum-cryptography/utils';

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const privateKey = evt.target.value;

    setPrivateKey(privateKey);
    const privateKeyUint8Array = hexToBytes(privateKey);

    console.log(privateKeyUint8Array);
    console.log(privateKeyUint8Array.length); // This should output 32
    const publicKey = await secp.publicKeyCreate(privateKeyUint8Array, false);
    console.log("Generated Public Key:", publicKey);


    const address  = bytesToHex(publicKey);
    console.log("Derived Address:", address);
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Your private key:
        <input placeholder="Type an private key:" value={privateKey} onChange={onChange}></input>
      </label>

      <label>
        Address: {address.slice(0,10)}
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
