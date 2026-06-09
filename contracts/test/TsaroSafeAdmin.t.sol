// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {TsaroSafe} from "../src/core/TsaroSafe.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract TsaroSafeAdminTest is Test {
    TsaroSafe public tsaroSafe;
    MockERC20 public mockERC20;
    address public owner;
    address public nonOwner;

    function setUp() public {
        owner = address(this);
        nonOwner = makeAddr("nonOwner");
        mockERC20 = new MockERC20();
        tsaroSafe = new TsaroSafe(address(0));
    }

    function testOwnerCanWithdrawNative() public {
        // Send some CELO to the contract
        uint256 amount = 10 ether;
        deal(address(tsaroSafe), amount);
        
        uint256 ownerInitialBalance = owner.balance;
        
        // Withdraw as owner
        tsaroSafe.withdrawNative(amount);
        
        assertEq(address(tsaroSafe).balance, 0);
        assertEq(owner.balance, ownerInitialBalance + amount);
    }

    function testNonOwnerCannotWithdrawNative() public {
        uint256 amount = 10 ether;
        deal(address(tsaroSafe), amount);
        
        vm.startPrank(nonOwner);
        vm.expectRevert(); // Should revert due to onlyOwner
        tsaroSafe.withdrawNative(amount);
        vm.stopPrank();
    }

    function testOwnerCanWithdrawERC20() public {
        uint256 amount = 500 ether;
        mockERC20.mint(address(tsaroSafe), amount);
        
        uint256 ownerInitialBalance = mockERC20.balanceOf(owner);
        
        // Withdraw as owner
        tsaroSafe.withdrawERC20(address(mockERC20), amount);
        
        assertEq(mockERC20.balanceOf(address(tsaroSafe)), 0);
        assertEq(mockERC20.balanceOf(owner), ownerInitialBalance + amount);
    }

    function testNonOwnerCannotWithdrawERC20() public {
        uint256 amount = 500 ether;
        mockERC20.mint(address(tsaroSafe), amount);
        
        vm.startPrank(nonOwner);
        vm.expectRevert(); // Should revert due to onlyOwner
        tsaroSafe.withdrawERC20(address(mockERC20), amount);
        vm.stopPrank();
    }

    // Explicitly allow receiving CELO for the test contract
    receive() external payable {}
}
