pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                               // Account used to deploy contract
    bool private operational;                                    // Blocks all state changes throughout the contract if false
    bool private consensus;
    uint private storedFunds;

    uint256 public airlineCount;
    struct Airline {
        bool registered;
        bool queued;
        bool paid;
        uint votes;
    }
    mapping(address => Airline) private airlines;

    struct Policy {
        bytes32 key;
        string flight;
        uint256 amount;
        address owner;
        uint256 credit;
    }
    mapping(address => Policy) private policies;

    mapping(bytes32 => bool) private credits;


    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor (address firstAirline)
        public
        {
            contractOwner = msg.sender;
            operational = true;
            airlines[firstAirline].registered = true;
            airlines[firstAirline].queued = true;
            airlines[firstAirline].paid = true;
            airlineCount++;
            consensus = false;
            storedFunds = 0;
        }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
        {
            require(operational, "Contract is currently not operational");
            _;  // All modifiers require an "_" which indicates where the function body will be added
        }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
        {
            require(msg.sender == contractOwner, "Caller is not contract owner");
            _;
        }
        /**
    * @dev Modifier that requires the flight key to have been credited from Oracle review
    */
    modifier requireCredit(address _address) 
        {
            bytes32 key = policies[_address].key;
            require(credits[key] == true, "There is no credit for this flight, on this account");
            _;
        }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational () 
        public 
        view 
        returns(bool) 
        {
            return operational;
        }
 
    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus (bool mode)
        external
        requireContractOwner 
        {
            operational = mode;
        }

    function countAirlines() public view returns (uint) 
        {
            return airlineCount;
        }
    
    function isAirline(address _address) view public returns (bool) 
        {   
            bool check = airlines[_address].registered;
            return check;
        }

    function isCustomer(address _address) view public returns (address) 
        {   
            address check = policies[_address].owner;
            return check;
        }

    function checkConsensus() private returns (bool) 
        {
            uint count = countAirlines();
            if (count > 3) {
                return consensus = true;
            }
        }

    function checkFunds() public view returns (uint) 
        {
            return storedFunds;
        }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline (address newAirline)
        external
        requireIsOperational
        returns(uint256 votes)
        {
            votes = airlines[newAirline].votes;

            if (consensus) {
                //place vote
                votes++;
                if (votes >= airlineCount.div(2)) {
                    airlines[newAirline].queued = true;
                }
                return(votes);
            } else {
                airlines[newAirline].queued = true;
                checkConsensus();
                return(votes);
            }
        }

    /**
    * @dev Pay for an airline in the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function confirmAirline (address newAirline)
        external
        requireIsOperational
        returns(bool)
        {
            if(airlines[newAirline].paid && airlines[newAirline].queued) {
                airlines[newAirline].registered = true;
                airlineCount++;
            }
            return airlines[newAirline].registered;
        }


   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy (bytes32 key, string flight, address owner, uint amount)
        external
        payable
        requireIsOperational
        {
            policies[owner].key = key;
            policies[owner].flight = flight;
            policies[owner].owner = owner;
            policies[owner].amount = amount;
            storedFunds += amount;
        }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees (bytes32 key)
        external
        requireIsOperational
        {
            credits[key] = true;
        }

    /**
     *  @dev Pays insurees for loss
    */
    function withdraw (address passenger)
        external
        requireIsOperational
        requireCredit(passenger)
        {
            require(policies[passenger].owner == passenger);
            require(policies[passenger].amount > 0);
            uint256 deposit = policies[passenger].amount;
            uint256 credit = deposit.mul(3).div(2);
            require(storedFunds >= credit);
            policies[passenger].amount = 0;
            passenger.transfer(credit);
        }
        

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund (address newAirline, uint funds)
        public
        payable
        requireIsOperational
        {
            airlines[newAirline].paid = true;
            storedFunds += funds;
        }

    function getFlightKey
        (
            address airline,
            string memory flight,
            uint256 timestamp
        )
        pure
        internal
        returns(bytes32) 
        {
            return keccak256(abi.encodePacked(airline, flight, timestamp));
        }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
        external
        payable 
        {
            // I guess since we have to call this here, throw in some arbitrary 
            // address for the funder - in this case the contract owner.
            fund(contractOwner, msg.value);
        }


}

