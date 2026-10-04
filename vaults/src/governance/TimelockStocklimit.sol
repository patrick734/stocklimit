// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";

/// @title TimelockStocklimit
/// @notice The Stocklimit governance timelock: every settings change on the vault protocol is scheduled in
///         public and can only run after the minimum delay (48 hours at launch). OpenZeppelin's
///         TimelockController, unchanged.
contract TimelockStocklimit is TimelockController {
    constructor(uint256 minDelay, address[] memory proposers, address[] memory executors, address admin)
        TimelockController(minDelay, proposers, executors, admin)
    {}
}
