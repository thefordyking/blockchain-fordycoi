console.log("starting blockchain node...");
const http = require("http");
const url = require("url");
const { Blockchain, Transaction } = require("savjeecoin");
const fs = require("fs");
const myChain = new Blockchain();

let port = process.env.PORT || 3000
let blockchain;
let activeminers = [];
let testpub = 'FORDYxff3baf17698aa6ee86002e22450a8fcc4acda4c4829d37437b23e996b88b7b88';
let testpriv = 'd2867e2e46030fa4570baa8c7674b41784fd1dbc0a76e5c192054d5cef36101d100d4734ee05b78c74bb3604ca834dbb39c190bcc75ce12ee523135de99edd10';

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

//FORDYxae250f0d6d54616c3091c8b6b1c6d8d1cc1f1b7735437a463b3a9de4cedfe77e

function gotdata(data) {
  blockchain = JSON.parse(data);
  myChain.chain = blockchain.chain;
  myChain.difficulty = blockchain.difficulty;
  myChain.pendingTransactions = blockchain.pendingTransactions;
  myChain.miningReward = blockchain.miningReward;
/*  let tmp = myChain.getNewminingblock();
  myChain.addblock(tmp,testpub);
*/
}

  fs.readFile("fordycoin-blockchain.json", (err, data) => gotdata(data));

function saveblockchain() {
  let data = JSON.stringify(myChain, null, 2);
  fs.writeFile("fordycoin-blockchain.json", `${data}`, err => console.log("blockchain saved"));
}

function fixstring(str) {
   str = str.split("'");
   str = str[1];
   return str;
}

function sendTransaction(fromAddress, toAddress, amount, priv) {
   let tmp3 = parseInt(amount);
   if ((myChain.getBalanceOfAddress(fromAddress) - tmp3)  < 0) {
       return 'fromAddress does not have enough funds';
   }
   let tmp = new Transaction(fromAddress, toAddress, amount);
   let tmp2 = tmp.signTransaction(priv);
   if(!tmp2 == 'success') {
      return tmp2;
   }
  tmp2 = myChain.addTransaction(tmp,priv);
   if(!tmp2 == 'success') {
      return tmp2;
   }
    console.log(myChain.pendingTransactions);
  return 'success';

}

let routes = {
    "main/createAddress": function(data, res) {
      let string = data.queryString;
      string = JSON.stringify(string);
      string = fixstring(string);
      let payload = myChain.createAddress(string);
      let payloadStr = JSON.stringify(payload);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.writeHead(200);
      res.write(payloadStr);
      res.end("\n");
    },

    // http://localhost:3000/main/sendTransaction?data='FORDYxff3baf17698aa6ee86002e22450a8fcc4acda4c4829d37437b23e996b88b7b88,FORDYxae250f0d6d54616c3091c8b6b1c6d8d1cc1f1b7735437a463b3a9de4cedfe77e,2,d2867e2e46030fa4570baa8c7674b41784fd1dbc0a76e5c192054d5cef36101d100d4734ee05b78c74bb3604ca834dbb39c190bcc75ce12ee523135de99edd10'

    "main/sendTransaction": function(data, res) {
      let string = data.queryString;
      string = JSON.stringify(string);
      string = fixstring(string);
      string = string.split(',');
      let payload = sendTransaction(string[0], string[1], string[2], string[3]);
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
}

server.listen(port, () =>{
console.log(`blockchain node listening at http://localhost:${port}`);
});