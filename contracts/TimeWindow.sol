// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
* @title TimeWindow token
* @author Denis L.
* @notice This is ERC20 token with time window, only inside which transfer is possible
* @dev All function calls are currently implemented without side effects
*/
contract TimeWindow is ERC20, Ownable {
    // address of contribution contract
    address public contributionAddress;

    // start time $TW can be transfered
    uint256 public startTime;

    // end time $TW can be transfered
    uint256 public endTime;

    // initial supply
    uint256 public constant INITIAL_SUPPLY = 1000;

    constructor(uint256 _startTime, uint256 _endTime) ERC20("TimeWindow", "TW") {
        _mint(msg.sender, INITIAL_SUPPLY);
        startTime = _startTime;
        endTime = _endTime;
    }

    /**
    * @notice Check if block timestamp is between startTime and endTime
    */
    modifier checkTime() {
        require(startTime <= block.timestamp && block.timestamp <= endTime, "Cant transfer now");
        _;
    }

    /**
    * @notice Set the address of Contribution contract
    * @param contributionAddr the address of Contribution contract
    */
    function setContributionAddress(address contributionAddr) external onlyOwner {
        contributionAddress = contributionAddr;
    }
    
    /**
    * @notice Transfers $TW to the recipient
    * @dev Override transfer function of Openzepplin ERC20 Token Standard with modifier 'checkTime'
    * @param to the recipient of the $TW
    * @param amount the amount of $TW to transfer
    */
    function transfer(address to, uint256 amount) public override checkTime returns (bool) {
        super.transfer(to, amount);
    }

    /**
    * @notice Transfers $TW from the sender to the recipient
    * @dev Override transferFrom function of Openzepplin ERC20 Token Standard with modifier 'checkTime'
    * @param from the sender of the $TW
    * @param to the recipient of the $TW
    * @param amount the amount of $TW to transfer
    */
    function transferFrom(address from, address to, uint256 amount) public override checkTime returns (bool) {
        super.transferFrom(from, to, amount);
    }

    /**
    * @notice Mint $TW to the recipient
    * @dev Only externally called by Contribution contract
    * @param to the recipient of the $TW
    * @param amount the amount of $TW to mint
    */
    function mint(address to, uint256 amount) external {
        require(msg.sender == contributionAddress, "Address not authorized");
        _mint(to, amount);
    }
}