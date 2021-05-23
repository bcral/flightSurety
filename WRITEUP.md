For Airline Use:

    - Click "Add New Airline" (Add/Vote button) - This feature controls both adding a new airline(before 50% consensus is required), and voting for an airline(after consensis is required).  Both happen the same way - enter the address for the airline to be added/voted for, then click "Add/Vote"
    - "Pay for Airline" (Pay button) - Pays for a new airline.  No controls are in place to limit amount(fixed at 10 ETH), restrict payment to a certain user type, or prevent multiple payments.  This isn't required for the project, so I'm sticking to the essentials.  This is used by adding the address for the airline to be paid for in the box, NOT the amount of 10 ETH.  I can't stress point this enough...

For Passenger/Insuree Use:

    - Click "Get Flights" to retrieve a list of flights registered by the airlines
    - Pick the flight to insure from the list of registered flights.
    - Enter the insurance deposit amount and flight key(NOT name - key) in the "New Insurance Policy" section
    - To check flight status, enter the flight name(NOT key) in the "Check Flight Status" section.
    - To withdraw funds that were credited to you, click Withdraw.  The funds will be sent to the address that was used to click the link - which must also be the address that created the policy.

Contract Logic:

    In App Contract - All calls are made to the App contract, which then pulls the necessary info from the Data contract.  The function names may be misleading, so here's a breakdown:
        - registerAirline() - Adds airline passed as argument to queue, or adds vote for airline
        - payAirlineFee() - Pays fee for airline address that is passed as argument, then sends that fee to Data contract for storage.
        - Flights are ENTIRELY HANDLED IN THE APP CONTRACT.  This might be contrary to the concept of separation of concerns, but the boilerplate put flight info in the App contract, so I'm just following along.

    In Data Contract - All airline and insurance policy data is stored here.  Some logic is kept here, just because it's central to the functionality of the program.  This isn't exactly as you would expect with data and logic separations, but the alternative is for the data contract to be purely a database that the app contract queries, with no functionality of it's own.  Why would the boilerplate code have functions in the Data contract if this was what they expected?



Run Ganache CLI with: ganache-cli -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" -l 9999999 -a 35

Addresses 0-4 are for airlines, 5-9 are for passengers, and 10-30 are for oracles.  If 31-35 are used anywhere, it's just for their gas so I can run tests longer between resets.

Versions:
Truffle v5.3.4 (core: 5.3.4)
Solidity - ^0.4.25 (solc-js)
Node v10.24.0
Web3.js v1.3.5