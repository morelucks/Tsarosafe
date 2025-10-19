// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {TsaroSafe} from "../src/TsaroSafe.sol";

/**
 * @title DeployTsaroSafe
 * @notice Deployment script for TsaroSafe contract
 */
contract DeployTsaroSafe is Script {
    function run() external {
        // Deploy contract
        vm.startBroadcast();
        
        TsaroSafe tsaroSafe = new TsaroSafe();
        
        vm.stopBroadcast();

        console.log("TsaroSafe deployed to:", address(tsaroSafe));
        console.log("Deployer:", msg.sender);
    }
}

