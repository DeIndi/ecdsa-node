const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const ethers = require("ethers");
const redis = require('redis');
const crypto = require('crypto');

let client;
async function connectToRedis() {
  client = redis.createClient({
  });

  client.on('error', (err) => console.log('Redis Client Error', err));
  client.on('end', () => {
    console.log('Redis client disconnected. Attempting to reconnect...');
    setTimeout(connectToRedis, 1000); // Attempt to reconnect after 1 second
  });

  await client.connect();
}

app.use(cors());
app.use(express.json());

const balances = {
  "04f6cd53bb8b2d843e3a3da86d2cc6dfdb632cd78adb38da87d227945f713c8fbc220b50ec3c272c378e2da8891f41d329b32a02ff0b987de2c81af80bc25d611a": 100,
  "046ee3e92983edcacd02620beb5fe3f560391590511cd4ce1a32ffa5049fa852a95d1e330ecce690c163ee660399b65dc0c2e00b468aac74ff0759e52b5388232b": 50,
  "04712015708765d2f9b3fd48ed889fd3aedd75781ca94b954f50c6b5991cb03c6553c201135ffb0717a07f5ec17bded7e14148d06f33296de9b0f39ddac4840eec": 75,
};
//373ea65fe322f7c89e1badc5f40d2d1c079817bfb1db016b704718ea44cc2fe8
//7857fcf344777e92b2d04abfc4d7e51bb5e9333ad2a6c84df03bb6b078af99d8
//5b6ce07dc064be7d09500bab4874677b87426af014496f4463413c70cf832af6

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

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

app.post('/auth/nonce', async (req, res) => {
  const {address}  = JSON.parse(req.body.body);
  console.log('got address: ', address);
  if (!ethers.utils.isAddress(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address' });
  }

  const nonce = setNonceForAddress(address);
  console.log('result nonce: ', nonce);
  res.json({nonce: nonce})
});

app.post('/auth/verify', async (req, res) => {
  const { address, signature } = JSON.parse(req.body.body);
  console.log('address: ', address);
  console.log('signature: ', signature);
  const nonce = await getNonceForAddress(address);
  console.log('recovered nonce from redis: ', nonce);
  const isVerified = verifySignature(nonce, signature, address);
  if (isVerified) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

function generateRandomNonce() {
  return crypto.randomBytes(16).toString('hex');
}

// Generate a nonce for an address and store it with an expiry
function setNonceForAddress(address) {
  const nonce = generateRandomNonce();
  console.log('generated random nonce: ', nonce);
  client.set(address, nonce, 'EX', 300, (err, reply) => {
    if (err) throw err; 
    console.log(reply);
  });
  return nonce;
}

// Retrieve a nonce for an address
async function getNonceForAddress(address) {
  try {
    const reply = await client.get(address);
    return reply; // This will be `null` if the key does not exist.
  } catch (err) {
    console.error('Error getting nonce for address:', err);
    throw err;
  }
}


function verifySignature(nonce, signature, address) {
  try {
    const signerAddress = ethers.utils.verifyMessage(nonce, signature);

    return signerAddress.toLowerCase() === address.toLowerCase();
} catch (error) {
    console.error("Error verifying signature:", error);
    return false;
}
}

connectToRedis().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch((error) => {
  console.error('Failed to connect to Redis:', error);
  process.exit(1); // Exit if we can't establish a Redis connection
});


function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
