// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {TsaroToken} from "../src/tokens/TsaroToken.sol";

contract DeployTokenScript is Script {
    function run() public {
        // Get deployment parameters from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory network = vm.envOr("NETWORK", string("localhost"));
        
        console.log("Deploying TsaroToken to network:", network);
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy TsaroToken
        console.log("Deploying TsaroToken...");
        TsaroToken token = new TsaroToken();
        console.log("TsaroToken deployed at:", address(token));
        console.log("Total Supply:", token.totalSupply() / 1e18, "TSARO");

        vm.stopBroadcast();

        // Output deployment summary
        console.log("\n=== TOKEN DEPLOYMENT SUMMARY ===");
        console.log("Network:", network);
        console.log("Token Address:", address(token));
        console.log("Token Name:", token.name());
        console.log("Token Symbol:", token.symbol());
        console.log("Total Supply:", token.totalSupply() / 1e18, "TSARO");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("===============================\n");
    }
}
