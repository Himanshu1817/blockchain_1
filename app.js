const fs = require('fs');
const express = require('express'); // import for creating the server
const bodyParser = require('body-parser');// to parse JSON data from incoming requests
//const blockchain = require('./blockchain'); // Assuming you have implemented the blockchain logic in blockchain.js
const crypto = require('crypto');
const app = express(); // instance of express and storing it in app
//const myBlockchain = new Blockchain(); // Create a new instance of the Blockchain
//Himashu sbse bda gadha insan hai.
//ekdum faltu insan
const port = 3000; //port number to listen the server

// Middleware to parse JSON in request body
app.use(bodyParser.json());


 const genesisBlock = {
     blockNo: "1",
     data: "",
     hash: "0x0000000000",
     nounce: "0",
   };
  

  let blockchain=[genesisBlock];
  // Function to verify the integrity of the blockchain
  function verifyBlockchain() {
    for (let i = 1; i < blockchain.length; i++) {
      const block = blockchain[i];
      const previousBlock = blockchain[i - 1];
      const blockData = JSON.stringify({ ...block, hash: "" });
      const generatedHash = crypto.createHash('sha256').update(blockData).digest('hex');
  
      if (block.hash !== generatedHash || block.previousHash !== previousBlock.hash) {
        console.log(`Blockchain integrity compromised at block ${block.blockNo}`);
        process.exit(1);
      }
    }
  }



// POST /block - To add a new block in the blockchain
app.post('/block', async (req, res) => {
    const data2 = await fs.readFileSync('./blockchain.json', 'utf8');
    const dataJSON = JSON.parse(data2);

  let blockchain = [...dataJSON];
  const data = req.body.data;
  const previousBlock = blockchain[blockchain.length - 1];
  let nounce = 0;
  let hash = "";

  while (true) {
    const blockData = JSON.stringify({ blockNo: blockchain.length.toString(), data, nounce, previousHash: previousBlock.hash });
    hash = crypto.createHash('sha256').update(blockData).digest('hex');
    if (hash.startsWith("00")) {
      break;
    }
    nounce++;
    if (nounce > 100000) {
      return res.status(500).json({ error: "Nounce not found in 100000 iterations." });
    }
  }

  const newBlock = {
    blockNo: blockchain.length.toString() ,
    data,
    hash,
    nounce,
    previousHash: previousBlock.hash,
  };

  blockchain.push(newBlock);

  
  fs.writeFileSync('blockchain.json', JSON.stringify(blockchain, null, 10));
  res.json(newBlock);
});

// GET /block - To get an existing block from the chain
app.get('/block', (req, res) => {

  const data2 =  fs.readFileSync('./blockchain.json', 'utf8');
  const dataJSON = JSON.parse(data2);
  let blockchain = [...dataJSON];
  
  const blockNo = req.query.blockNo;
  if (!blockNo || blockNo < 1 || blockNo > blockchain.length) {
    return res.status(400).json({ error: "Invalid block number." });
  }
  const block = blockchain[blockNo - 1];
  res.json(block);
});

// GET /block/stats - To get info about the chain
app.get('/block/stats', (req, res) => {

  const data2 =  fs.readFileSync('./blockchain.json', 'utf8');
  const dataJSON = JSON.parse(data2);
  let blockchain = [...dataJSON];
  
  const latestBlockHash = blockchain[blockchain.length - 1].hash;
  res.json({ blockCount: blockchain.length, latestBlockHash });
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

