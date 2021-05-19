
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        // Add airline transaction
        DOM.elid('add-airline').addEventListener('click', () => {
            let newAirline = DOM.elid('airline-add').value;
            // Write transaction
            contract.registerAirline(newAirline, (error, result) => {
                display('New Airline', '', [ { label: 'New Airline Submitted/Voted For:', error: error, value: result} ]);
                console.log(error, result);
            });
        });

        // Pay for airline transaction
        DOM.elid('pay-airline').addEventListener('click', () => {
            let airline = DOM.elid('airline-pay').value;
            // Write transaction
            contract.payForAirline(airline, (error, result) => {
                display('New Airline Funded', '', [ { label: 'Airline Funded:', error: error, value: result} ]);
                console.log(error, result);
            });
        });

        // Add flight
        DOM.elid('add-flight').addEventListener('click', () => {
            let flight = DOM.elid('new-flight-number').value;
            // Write transaction
            contract.registerFlight(flight, (error, result) => {
                display('New Flight', '', [ { label: 'New Flight Generated:', error: error, value: result} ]);
                console.log(error, result);
            });
        });
    
        // Add new policy
        DOM.elid('add-policy').addEventListener('click', () => {
            let flightKey = DOM.elid('insurance-flight-number').value;
            let amount = DOM.elid('insurance-payment').value;
            // Write transaction
            contract.purchase(flightKey, amount, (error, result) => {
                console.log(error, result);
            });
        });

        // Return list of flights to display
        DOM.elid('get-flights').addEventListener('click', () => {
            // Write transaction
            result = contract.getFlights((error, result) => {
            displayFlights([ { label: 'Flight:', error: error, value: result} ]);
            console.log(result);
            });
        });

        // Withdraw funds from insurance for selected flight #
        DOM.elid('withdraw').addEventListener('click', () => {
            // Write transaction
            contract.withdraw((error, result) => {
                console.log(error, result);
            });
        });

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        });
    
    });
    

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);
}

function displayFlights(results) {
    let displayDiv = DOM.elid("flight-wrapper");
    let section = DOM.section();
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}
