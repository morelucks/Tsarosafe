// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {TsaroSafe} from "../src/TsaroSafe.sol";

contract DeployToCeloScript is Script {
    function run() public {
        // Get deployment parameters from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory network = vm.envOr("NETWORK", string("celo-alfajores"));
        
        console.log("Deploying TsaroSafe to Celo network:", network);
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy TsaroSafe
        console.log("Deploying TsaroSafe...");
        TsaroSafe tsaroSafe = new TsaroSafe();
        console.log("TsaroSafe deployed at:", address(tsaroSafe));

        vm.stopBroadcast();

        // Output deployment summary
        console.log("\n=== CELO DEPLOYMENT SUMMARY ===");
        console.log("Network:", network);
        console.log("TsaroSafe Contract:", address(tsaroSafe));
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Block Explorer:", getExplorerUrl(network));
        console.log("===============================\n");
    }

    function getExplorerUrl(string memory network) internal pure returns (string memory) {
        if (keccak256(abi.encodePacked(network)) == keccak256(abi.encodePacked("celo"))) {
            return "https://explorer.celo.org";
        } else if (keccak256(abi.encodePacked(network)) == keccak256(abi.encodePacked("celo-alfajores"))) {
            return "https://alfajores.celoscan.io";
        } else if (keccak256(abi.encodePacked(network)) == keccak256(abi.encodePacked("celo-baklava"))) {
            return "https://baklava.celoscan.io";
        }
        return "https://explorer.celo.org";
    }
}
