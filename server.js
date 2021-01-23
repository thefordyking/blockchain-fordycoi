console.log("starting blockchain node...");
const { Blockchain, Transaction } = require("savjeecoin");
const express = require("express");
const fs = require("fs");
const app = express();
const myChain = new Blockchain();

let port = process.env.PORT;
let blockchain;
let testpub = 'FORDYxa16d78a471e0dc4f2cdfec6fdbebde5985ce907dc35c89eee194c6713e24d57c';
let testpriv = '8f7cedcdb0bc98e3b82711bfe25c47f4cd6755f7227f9f264772f9278d19cb67' ;

function gotdata(data) {
  blockchain = JSON.parse(data);
  myChain.chain = blockchain.chain;
  myChain.difficulty = blockchain.difficulty;
  myChain.pendingTransactions = blockchain.pendingTransactions;
  myChain.miningReward = blockchain.miningReward;
 // maketx();
testb();
}

  fs.readFile("fordycoin-blockchain.json", (err, data) => gotdata(data));

function saveblockchain() {
  let data = JSON.stringify(myChain, null, 2);
  fs.writeFile("fordycoin-blockchain.json", `${data}`, err => console.log("blockchain saved"));
}

function maketx() {
  let tx = new Transaction(null, "mine", 0.01);
  tx.signTransaction(null);
  myChain.addTransaction(tx);
  myChain.minePendingTransactions(testpub);
//  myChain.minePendingTransactions(testpub);
  tx = new Transaction(testpub, "mine", 0.005);
  tx.signTransaction(testpriv);
  myChain.addTransaction(tx);
  myChain.minePendingTransactions(testpub);
  //console.log(myChain);
  console.log(myChain.getBalanceOfAddress(testpub));
}

function testb() {
  let start, end;
  start = Date.now();
  console.log('starting  test');
  let tx = new Transaction(null, "mine", 0.01);
  tx.signTransaction(null);
  myChain.addTransaction(tx);
  myChain.minePendingTransactions(testpub);
  end = Date.now();
  let time = end - start;
    fs.writeFile("results.txt", `${time}`, err => console.log("test results saved!!!!!"));
  console.log(time);
}

app.get("/", (req, res) => {
  console.log("request recived");
  res.send("Hello World!");
});

app.get("/all", (request, response) => {
  console.log("requst recived");
  let data = { x: 5 };
  response.json(data);
  response.send();
});

app.listen(port, () =>{
console.log(`blockchain node listening at http://localhost:${port}`);
});
