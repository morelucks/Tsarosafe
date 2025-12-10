// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {TsaroSafe} from "../src/core/TsaroSafe.sol";

contract DeployTsaroSafeScript is Script {
    function run() public {
        // Get deployment parameters from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory network = vm.envOr("NETWORK", string("celo-alfajores"));
        address goodDollarAddress = vm.envAddress("GOOD_DOLLAR_ADDRESS");
        address celoAddress = vm.envOr("CELO_ADDRESS", address(0));

        console.log("Deploying TsaroSafe to network:", network);
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        console.log("GoodDollar address:", goodDollarAddress);
        console.log("CELO address:", celoAddress);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy TsaroSafe with token addresses
        console.log("Deploying TsaroSafe...");
        TsaroSafe tsaroSafe = new TsaroSafe(goodDollarAddress, celoAddress);
        console.log("TsaroSafe deployed at:", address(tsaroSafe));

        vm.stopBroadcast();

        // Output deployment summary
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network:", network);
        console.log("TsaroSafe Contract:", address(tsaroSafe));
        console.log("GoodDollar Address:", goodDollarAddress);
        console.log("CELO Address:", celoAddress);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("========================\n");
    }
}
