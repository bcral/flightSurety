import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.metamaskAccountID;
        // Arbitrary number, since none of these matter.
        this.timestamp = 2;
        this.displayFlights = [];
    }


    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({from: self.owner}, callback);
    }

    // Function for calling the "registerAirline" function in FlightSurityApp contract
    registerAirline(newAirline, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .registerAirline(newAirline)
            .send({from: self.airlines[0]}, (error, result) => {
                callback(error, newAirline);
            });
     }

    // Function for calling the "registerAirline" function in FlightSurityApp contract
    payForAirline(airline, callback) {
        let self = this;
        const fee = 10000000000000000000;
        self.flightSuretyApp.methods
            .payAirlineFee(airline)
            .send({from: self.airlines[0], value: fee}, (error, result) => {
                callback(error, airline);
            });
    }

    // Function for creating a new flight
    registerFlight(flight, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .registerFlight(flight, self.timestamp)
            .send({
                from: self.airlines[0],
                gas: 4712388,
                gasPrice: 100000000000
            }, (error, result) => {
                callback(error, flight);
            });
    }

    // Function for retrieving registered flights and finding the goddamn key
    async getFlights(callback) {
        let self = this;
        let length = await self.flightSuretyApp.methods.returnFlightsLength().call();
        self.displayFlights = [];

        // Loop that writes flights to local array, because you can't just return them
        for (let i = 0; i < length; i++) {
            // Get key from array of flight keys
            let flight = await self.flightSuretyApp.methods.getFlight(i).call({from: self.owner}, callback);
            // Write flight values to local variable
            self.displayFlights.push(flight);
        }
        return self.displayFlights;
    }

    // Function for purchasing insurance for a designated flight number
    purchase(flightKey, payment, callback) {
        let self = this;
        let amount = payment * 1000000000000000000;
        self.flightSuretyApp.methods
            .buy(flightKey)
            .send({from: self.passengers[0], value: amount}, (error, result) => {
                callback(error, result);
            });
    }

    // Function for withdrawing funds from purchased insurance
    withdraw(callback) {
        let self = this;
        self.flightSuretyApp.methods
            .withdraw()
            .send({from: self.passengers[0]}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }
}