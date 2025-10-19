// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {TsaroSafe} from "../src/TsaroSafe.sol";

/**
 * @title TsaroSafeTest
 * @notice Test suite for TsaroSafe contract
 */
contract TsaroSafeTest is Test {
    TsaroSafe public tsaroSafe;
    address public user1;
    address public user2;
    address public user3;

    event GroupCreated(
        uint256 indexed groupId,
        address indexed creator,
        string name,
        uint256 targetAmount,
        bool isPrivate
    );
    
    event MemberJoined(
        uint256 indexed groupId,
        address indexed member
    );
    
    event ContributionMade(
        uint256 indexed groupId,
        address indexed member,
        uint256 amount
    );
    
    event GroupCompleted(
        uint256 indexed groupId,
        uint256 totalAmount
    );
    
    event UserVerified(
        address indexed user,
        uint256 timestamp
    );

    function setUp() public {
        // Create test users
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        // Deploy contract
        tsaroSafe = new TsaroSafe();
    }

    function testContractDeployment() public {
        assertTrue(address(tsaroSafe) != address(0));
        
    }
}
