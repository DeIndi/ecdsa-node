const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

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

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
