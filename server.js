console.log("starting blockchain node...");
const http = require("http");
const url = require("url");
const { Blockchain, Transaction } = require("savjeecoin");
const fs = require("fs");
const myChain = new Blockchain();

let port = process.env.PORT || 3000
let blockchain;
let activeminers = [];
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

function newblock(address) {
      let data = myChain.getNewminingblock();
      let miner = {"hash":data.hash,"miner":address};
      activeminers.push(miner);
      data = JSON.stringify(data);
      return data; 
}

function addblock(block) {
     let mhash = block.hash;
     for (let i=0; i<activeminers.length;i++) {
       if (mhash==activeminers[i].hash) {
           let address = activeminers[i].miner;
           myChain.addblock(block, address);
           return 'succses';
       }
    }
  return 'are you sure thats a valaid block?';
}


let routes = {
    "mine/newblock": function(data, res) {
      let string = data.queryString;
      string = JSON.stringify(string);
      string = fixstring(string);
      let payload = newblock(string);
      let payloadStr = JSON.stringify(payload);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.writeHead(200);
      res.write(payloadStr);
      res.end("\n");
    },
   "mine/addblock": function(data, res) {

    },
  "all": function(data, res) {
 
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