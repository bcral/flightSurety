import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
import "babel-polyfill";


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

////////////////////////////////// REGISTER ORACLES ////////////////////////////////

async function registerOracles() {
    
  // ARRANGE
  let fee = await flightSuretyApp.methods.REGISTRATION_FEE().call({from: web3.eth.defaultAccount});

  // ACT
  // Start with the 10th address and go to the 30th.  Leave the first 10 for airlines and passengers.
  for(let a=10; a<30; a++) {   
    let account = web3.eth.accounts[a];
    
    await flightSuretyApp.methods.registerOracle().send({
      from: account, 
      value: fee, 
      gas: 4712388, 
      gasPrice: 100000000000
    });
    let result = await flightSuretyApp.methods.getMyIndexes().call({from: account});
    console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
  }
}

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log(event)
});

flightSuretyApp.events.FlightAdded({
  fromBlock: 0
}, function (error, event) {
  if (error) console.log(error)
  console.log(event)
});

registerOracles();

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


