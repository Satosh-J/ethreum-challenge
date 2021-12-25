// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TimeWindow.sol";

/**
* @title Contribution
* @author Denis L.
* @notice You can use this contract to contribute eth and receive $TW tokens
* @dev All function calls are currently implemented without side effects
*/
contract Contribution is Ownable {
    using SafeMath for uint256;

    // mint price
    uint256 public constant MINT_PRICE = 0.01 ether;

    // reference to the TimeWindow contract for minting $TW tokens
    TimeWindow timeWindow;

    // event when new token is issued
    event TokenIssued(address to, uint256 amount);

    // maps address to amount of donated eth
    mapping(address => uint256) public donatedEth; //Track eth per address
 
    /**
    * @notice Issue $TW tokens in return for donated eth
    * @dev amount can only be integer
    */
    function contribute() public payable {
        uint256 value = msg.value;
        require(value > 0, "No eth sent");

        // calculate amount of tokens to mint
        uint256 amount = value.div(MINT_PRICE);

        donatedEth[msg.sender] = value;

        timeWindow.mint(msg.sender, amount);

        emit TokenIssued(msg.sender, amount);
    }

    /**
    * @notice Return amount of eth donated by a wallet address
    * @param donator the donator of the eth
    */
    function getDonatedEth(address donator) public view returns (uint256) {
        return donatedEth[donator];
    }

    /**
    * @notice Set the address of TimeWindow contract
    * @param timeWindowAddr the address of TimeWindow contract
    */
    function setTimeWindowAddress(address timeWindowAddr) external onlyOwner {
        timeWindow = TimeWindow(timeWindowAddr);
    }
}