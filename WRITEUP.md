Airline Functionality:

    In GUI:
        "Add New Airline" (Add/Vote button) - This feature controls both adding a new airline(before 50% consensus is required), and voting for an airline(after consensis is required).  
        "Pay for Airline" (Pay button) - Pays for a new airline.  No controls are in place to limit amount, restrict payment to a certain user type, or prevent multiple payments.  This isn't required for the project, so I'm not wasting my time.

    Contract Logic:
        In App Contract - All calls are made to the App contract, which then funnels them to the Data contract.  The function names may be misleading, so here's a breakdown:
            -registerAirline() - Adds airline passed as argument to queue, or adds vote for airline
            -payAirlineFee() - Pays fee for airline passed as argument, then sends that fee to Data contract for storage.
*in Data => -confirmAirline() - Checks that airline passed as argument had both                   been added to the queue and paid for, then returns boolean to App                     contract for confirmation.

        In Data Contract - Voting, consensus, and all airline data is stored here.  Some logic is kept here, just because it's central to the functionality of the program.  This isn't exactly as you would expect with data and logic separations, but the alternative is for the data contract to be purely a database that the app contract queries, with no functionality of it's own.  Why would the boilerplate code have functions in the Data contract if this was what they expected?


Passenger Functionality:

    In GUI:

    Contract Logic:
        In App Contract -
        In Data Contract -