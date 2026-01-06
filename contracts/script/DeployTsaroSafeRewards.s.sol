// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {TsaroSafeRewardsAdapter} from "../src/core/TsaroSafeRewardsAdapter.sol";

/**
 * @title DeployTsaroSafeRewardsScript
 * @notice Deploys the TsaroSafeRewardsAdapter on Celo (dev or mainnet)
 *
 * Env vars:
 *  - PRIVATE_KEY:        Deployer private key
 *  - TSAROSAFE_ADDRESS:  Deployed TsaroSafe contract address
 *  - ENGAGEMENT_REWARDS_ADDRESS: EngagementRewards contract address
 *       * Dev:  0xb44fC3A592aDaA257AECe1Ae8956019EA53d0465
 *       * Prod: 0x25db74CF4E7BA120526fd87e159CF656d94bAE43
 */
contract DeployTsaroSafeRewardsScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address tsaroSafe = vm.envAddress("TSAROSAFE_ADDRESS");
        address rewards = vm.envAddress("ENGAGEMENT_REWARDS_ADDRESS");
        string memory network = vm.envOr("NETWORK", string("celo"));

        console.log("Deploying TsaroSafeRewardsAdapter to network:", network);
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        console.log("TsaroSafe address:", tsaroSafe);
        console.log("EngagementRewards address:", rewards);

        vm.startBroadcast(deployerPrivateKey);

        TsaroSafeRewardsAdapter adapter = new TsaroSafeRewardsAdapter(tsaroSafe, rewards);

        vm.stopBroadcast();

        console.log("\n=== TSAROSAFE REWARDS ADAPTER DEPLOYMENT SUMMARY ===");
        console.log("Network:", network);
        console.log("Adapter Address:", address(adapter));
        console.log("TsaroSafe:", tsaroSafe);
        console.log("EngagementRewards:", rewards);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("===================================================\n");
    }
}


