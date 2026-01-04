// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "forge-std/interfaces/IERC20.sol";

/**
 * @title TsaroToken (TSARO)
 * @notice ERC-20 token for the TsaroSafe platform
 * @dev Implements IERC20 interface with minting, burning, and ownership controls
 */
contract TsaroToken is IERC20 {
    // ============ Constants ============
    
    /// @notice Token name
    string public constant name = "TsaroToken";
    
    /// @notice Token symbol
    string public constant symbol = "TSARO";
    
    /// @notice Token decimals
    uint8 public constant decimals = 18;
    
    /// @notice Initial supply: 1 billion TSARO
    uint256 private constant INITIAL_SUPPLY = 1_000_000_000 * 10 ** 18;

    // ============ State Variables ============
    
    /// @notice Total token supply
    uint256 public totalSupply;
    
    /// @notice Contract owner address
    address public owner;

    /// @notice Token balances
    mapping(address => uint256) public balanceOf;
    
    /// @notice Token allowances
    mapping(address => mapping(address => uint256)) public allowance;

    // ============ Events ============
    
    /// @notice Emitted when ownership is transferred
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ============ Custom Errors ============
    
    error NotOwner();
    error ZeroAddress();
    error InsufficientBalance();
    error InsufficientAllowance();
    error InvalidAmount();
    error MintToZeroAddress();

    // ============ Modifiers ============
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
        totalSupply = INITIAL_SUPPLY;
        balanceOf[msg.sender] = INITIAL_SUPPLY;
        emit Transfer(address(0), msg.sender, INITIAL_SUPPLY);
    }

    // ============ ERC-20 Functions ============
    
    /**
     * @notice Transfer tokens to a specified address
     * @param to Recipient address
     * @param amount Amount to transfer
     * @return success True if transfer succeeds
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @notice Approve spender to transfer tokens on behalf of caller
     * @param spender Spender address
     * @param amount Amount to approve
     * @return success True if approval succeeds
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        if (spender == address(0)) revert ZeroAddress();
        
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @notice Transfer tokens from one address to another using allowance
     * @param from Sender address
     * @param to Recipient address
     * @param amount Amount to transfer
     * @return success True if transfer succeeds
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 currentAllowance = allowance[from][msg.sender];
        if (currentAllowance < amount) revert InsufficientAllowance();
        
        // Use unchecked for allowance subtraction since we've already checked it
        unchecked {
            allowance[from][msg.sender] = currentAllowance - amount;
        }
        
        _transfer(from, to, amount);
        return true;
    }

    // ============ Owner Functions ============

    /**
     * @notice Mint new tokens (only owner)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert MintToZeroAddress();
        if (amount == 0) revert InvalidAmount();

        totalSupply += amount;
        balanceOf[to] += amount;

        emit Transfer(address(0), to, amount);
    }

    // ============ Public Functions ============
    
    /**
     * @notice Burn tokens from caller's balance
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        
        uint256 accountBalance = balanceOf[msg.sender];
        if (accountBalance < amount) revert InsufficientBalance();

        unchecked {
            balanceOf[msg.sender] = accountBalance - amount;
            totalSupply -= amount;
        }

        emit Transfer(msg.sender, address(0), amount);
    }

    // ============ Internal Functions ============
    
    /**
     * @notice Internal transfer function
     * @param from Sender address
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function _transfer(address from, address to, uint256 amount) internal {
        if (to == address(0)) revert ZeroAddress();
        
        uint256 fromBalance = balanceOf[from];
        if (fromBalance < amount) revert InsufficientBalance();

        unchecked {
            balanceOf[from] = fromBalance - amount;
            balanceOf[to] += amount;
        }

        emit Transfer(from, to, amount);
    }

    /**
     * @notice Transfer ownership to a new address
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();

        address oldOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
