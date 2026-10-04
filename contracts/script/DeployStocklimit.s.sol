// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {RouterStocklimit} from "../src/RouterStocklimit.sol";
import {QuoterStocklimit} from "../src/QuoterStocklimit.sol";
import {BookStocklimit, IRouterStocklimit} from "../src/BookStocklimit.sol";
import {IUniswapV3Factory} from "../src/interfaces/IExternal.sol";

/// Deploys RouterStocklimit, QuoterStocklimit and BookStocklimit from one wallet. Signs with an encrypted
/// Foundry keystore, never a raw key (launch.sh runs this):
///   forge script script/DeployStocklimit.s.sol --rpc-url robinhood --broadcast --account <keystore> --password-file <file>
/// FILLER_FEE_BPS (default 10 = 0.10%) is fixed forever at deployment; the max is 100 (1%).
contract DeployStocklimit is Script {
    address constant V3_FACTORY = 0x1f7d7550B1b028f7571E69A784071F0205FD2EfA;
    address constant POOL_MANAGER = 0x8366a39CC670B4001A1121B8F6A443A643e40951;
    address constant WETH = 0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73;

    function run() external {
        uint256 fee = vm.envOr("FILLER_FEE_BPS", uint256(10));
        require(fee <= 100, "FILLER_FEE_BPS above 100 (1%)");
        require(V3_FACTORY.code.length > 0, "v3 factory missing");
        require(POOL_MANAGER.code.length > 0, "v4 PoolManager missing");
        require(WETH.code.length > 0, "WETH missing");

        vm.startBroadcast();
        RouterStocklimit router = new RouterStocklimit(IUniswapV3Factory(V3_FACTORY), IPoolManager(POOL_MANAGER), WETH);
        QuoterStocklimit quoter = new QuoterStocklimit(IUniswapV3Factory(V3_FACTORY), IPoolManager(POOL_MANAGER), WETH);
        BookStocklimit book = new BookStocklimit(IRouterStocklimit(address(router)), fee);
        vm.stopBroadcast();

        console2.log("ROUTER=", address(router));
        console2.log("QUOTER=", address(quoter));
        console2.log("BOOK=", address(book));
        console2.log("fillerFeeBps=", fee);
    }
}
