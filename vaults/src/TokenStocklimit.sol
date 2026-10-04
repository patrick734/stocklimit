// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/// @title TokenStocklimit ($LIMIT)
/// @notice Fixed-supply token. Supply only ever shrinks, through BuyBurn or voluntary burns.
contract TokenStocklimit is ERC20, ERC20Burnable {
    constructor(address recipient, uint256 supply) ERC20("Stocklimit", "LIMIT") {
        _mint(recipient, supply);
    }
}
