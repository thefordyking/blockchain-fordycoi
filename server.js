console.log("starting blockchain node...");
const http = require("http");
const url = require("url");
const { Blockchain, Transaction } = require("savjeecoin");
const fs = require("fs");

let port = process.env.PORT || 3000;
const myChain = new Blockchain();
let blockchain;
let testpub = 'FORDYxa16d78a471e0dc4f2cdfec6fdbebde5985ce907dc35c89eee194c6713e24d57c';
let testpriv = '8f7cedcdb0bc98e3b82711bfe25c47f4cd6755f7227f9f264772f9278d19cb67' ;

const server = http.createServer(function(req, res) {
  let parsedURL = url.parse(req.url, true);
  let path = parsedURL.pathname;
  path = path.replace(/^\/+|\/+$/g, "");
  let qs = parsedURL.query;
  let headers = req.headers;
  let method = req.method.toLowerCase();

  req.on("data", function() {
    //if no data is passed we don't see this messagee
    //but we still need the handler so the "end" function works.
  });
  req.on("end", function() {
    //request part is finished... we can send a response now
    //we will use the standardized version of the path
    let route =
      typeof routes[path] !== "undefined" ? routes[path] : routes["notFound"];
    let data = {
      path: path,
      queryString: qs,
      headers: headers,
      method: method
    };
    route(data, res);
  });
});


function gotdata(data) {
  blockchain = JSON.parse(data);
  myChain.chain = blockchain.chain;
  myChain.difficulty = blockchain.difficulty;
  myChain.pendingTransactions = blockchain.pendingTransactions;
  myChain.miningReward = blockchain.miningReward;
 // maketx();
  //test();
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

function test() {
    console.log('starting test');
    let tx = new Transaction(null, "mine", 0.01);
    tx.signTransaction(null);
    myChain.addTransaction(tx);
    let time = Date.now();
    myChain.minePendingTransactions(testpub);
    console.log(Date.now() - time);
}

function  reqall() {
  console.log("requst recived");
  let data = { x: 5 };
  return data;
}

let routes = {
  "all": function(data, res) {
    let payload = reqall();
    let payloadStr = JSON.stringify(payload);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(200);
    res.write(payloadStr);
    res.end("\n");
  },
  notFound: function(data, res) {
    let payload = {
      message: "File Not Found",
      code: 404
    };
    let payloadStr = JSON.stringify(payload);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(404);

    res.write(payloadStr);
    res.end("\n");
  }
};

server.listen(port, () =>{
  console.log(`Listening on port ${port}`);
});