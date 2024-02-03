import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1-compat"
import { hexToBytes, bytesToHex } from 'ethereum-cryptography/utils';
import {ethers} from 'ethers';

async function signIn() {
  if (window.ethereum) {
    console.log(ethers);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    console.log('sending address:', address);
     const {data:{nonce}} = await server.post('/auth/nonce', { method: 'POST', body: JSON.stringify({ address }), headers: {'Content-Type': 'application/json'} });
    console.log('nonce:', nonce);
    // Sign the nonce
    const signature = await signer.signMessage(nonce);
    console.log('signature: ', signature);
    // Send the signature and address back to the server for verification
    const { data:{authenticated} } = await server.post('/auth/verify', { method: 'POST', body: JSON.stringify({ address, signature }), headers: {'Content-Type': 'application/json'} });

    if (authenticated) {
      console.log("Authentication successful!");
    } else {
      console.log("Authentication failed.");
    }
  } else {
    console.log("Ethereum wallet is not available.");
  }
}

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const privateKey = evt.target.value;

    setPrivateKey(privateKey);
    const privateKeyUint8Array = hexToBytes(privateKey);

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

      <button onClick={signIn}>Sign In</button>

      <label>
        Address: {address.slice(0,10)}
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
