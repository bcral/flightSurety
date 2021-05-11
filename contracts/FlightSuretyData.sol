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

    uint256 public airlineCount;
    struct Airline {
        bool registered;
        bool paid;
        uint votes;
    }
    mapping(address => Airline) private airlines;

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

            //make the owner an airline, just to make everything smoother
            airlines[contractOwner].registered = true;
            airlines[contractOwner].paid = true;
            airlines[firstAirline].registered = true;
            airlines[firstAirline].paid = true;
            airlineCount++;
            consensus = false;
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

    modifier requirePayment(address _address)
        {
            require(airlines[_address].paid);
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
    
    function checkAirline (address _address) public view returns (bool)
        {
            return airlines[_address].registered;
        }

    function isAirline(address _address) view public returns (bool) 
        {   
            bool check = airlines[_address].registered;
            return check;
        }

    function isPaid(address _address) view public returns (bool) 
        {   
            return airlines[_address].paid;
        }

    function checkConsensus() private returns (bool) 
        {
            uint count = countAirlines();
            if (count > 3) {
                return consensus = true;
            }
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
        returns(uint)
        {
            if (consensus) {
                //place vote
                airlines[newAirline].votes++;
                if (airlines[newAirline].votes >= airlineCount.div(2)) {
                    airlines[newAirline].registered = true;
                    airlineCount++;
                }
            } else {
                airlines[newAirline].registered = true;
                airlineCount++;
            }
            checkConsensus();
        }


    /**
    * @dev Pay for an airline in the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function payForAirline (address newAirline)
        external
        payable
        requireIsOperational
        {
            airlines[newAirline].paid = true;
        }


   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy ()
        external
        payable
        {

        }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees ()
        external
        pure
        {
            
        }
        

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay ()
        external
        pure
        {

        }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund ()
        public
        payable
        {

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
            fund();
        }


}

