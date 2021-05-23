
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`1. (multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`2. (multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`3. (multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`4. (multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('5. (airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirline.call(newAirline); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  it('6. (caller) airline was not registered just because it was paid for', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.payAirlineFee(newAirline, {from: config.testAddresses[34], value: 10000000000000000000});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirline.call(newAirline, {from: config.firstAirline}); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to be registered if it isn't paid for");

  });

  it('7. (airline) registers another Airline using registerAirline() and funds it with payAirlineFee()', async () => {
    
    // ARRANGE
    let newAirline = accounts[3];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
        await config.flightSuretyApp.payAirlineFee(newAirline, {from: config.firstAirline, value: 10000000000000000000});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirline.call(newAirline, {from: config.firstAirline}); 
    let result2 = await config.flightSuretyData.checkFunds.call({from: config.firstAirline});

    // ASSERT
    assert.equal(result, true, "Airline should be able to register another airline and fund it");
    assert.equal(result2, 10000000000000000000, "Funds should be transfered to Data Contract's 'storeFunds'");
  });

  it('8. (caller) registers a ton of airlines, to check consensis', async () => {
    // ARRANGE

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(accounts[4], {from: config.firstAirline});
        await config.flightSuretyApp.payAirlineFee(accounts[4], {from: accounts[4], value: 10000000000000000000});
        await config.flightSuretyApp.registerAirline(accounts[5], {from: config.firstAirline});
        await config.flightSuretyApp.payAirlineFee(accounts[5], {from: accounts[5], value: 10000000000000000000});
        await config.flightSuretyApp.registerAirline(accounts[6], {from: config.firstAirline});
        await config.flightSuretyApp.payAirlineFee(accounts[6], {from: accounts[6], value: 10000000000000000000});
    }
    catch(e) {
      console.log(e)
    }
    let result = await config.flightSuretyData.isAirline.call(accounts[6], {from: config.firstAirline});
    let result2 = await config.flightSuretyApp.returnAirlineCount.call({from: config.firstAirline});

    // ASSERT
    assert.equal(result, false, "Airline should not be able to be registered if it doesn't have the votes");
    assert.equal(result2, 4, "Airline count should be ???");
  });

});
