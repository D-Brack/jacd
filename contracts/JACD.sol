// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import 'hardhat/console.sol';
import './JACDToken.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract JACD {
    JACDToken public jacdToken;
    IERC20 public usdcToken;

    uint256 public jacdSupply;
    uint256 public usdcBalance;

    constructor(JACDToken _jacdToken, IERC20 _usdcToken) {
        jacdToken = _jacdToken;
        usdcToken = _usdcToken;
    }

    receive() external payable {}

    // Receive usdc deposits & Distribute tokens
    function receiveDeposit(uint256 _amount) public {
        require(
            _amount > 0,
            'JACD: deposit amount of 0'
        );

        require(
            usdcToken.transferFrom(msg.sender, address(this), _amount),
            'JACD: USDC transfer failed'
        );

        distributeTokens(msg.sender, _amount);

        usdcBalance += _amount;
    }

    function distributeTokens(address _depositer, uint256 _amount) private {
        require(
            jacdToken.mint(_depositer, _amount),
            'JACD: distribution of JACD tokens failed'
        );

        jacdSupply += _amount;
    }

    // Accept proposals

    // Handle votes (call votes contracts? or let votes contracts handle it all?)
        // Burn tokens used to vote

    // Finalize proposals & distribute funds

}
