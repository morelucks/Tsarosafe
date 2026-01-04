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

    constructor() {
        owner = msg.sender;
        totalSupply = 1_000_000_000 * 10 ** 18; // 1 billion TSARO
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    /**
     * @notice Transfer tokens
     * @param _to Recipient address
     * @param _value Amount to transfer
     */
    function transfer(address _to, uint256 _value) external returns (bool) {
        if (_to == address(0)) revert ZeroAddress();
        if (balanceOf[msg.sender] < _value) revert InsufficientBalance();

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * @notice Approve spender
     * @param _spender Spender address
     * @param _value Amount to approve
     */
    function approve(address _spender, uint256 _value) external returns (bool) {
        if (_spender == address(0)) revert ZeroAddress();
        
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @notice Transfer from
     * @param _from Sender address
     * @param _to Recipient address
     * @param _value Amount to transfer
     */
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool) {
        if (_to == address(0)) revert ZeroAddress();
        if (balanceOf[_from] < _value) revert InsufficientBalance();
        if (allowance[_from][msg.sender] < _value) revert InsufficientAllowance();

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
     * @notice Mint new tokens (only owner)
     * @param _to Recipient address
     * @param _amount Amount to mint
     */
    function mint(address _to, uint256 _amount) external onlyOwner {
        if (_to == address(0)) revert MintToZeroAddress();
        if (_amount == 0) revert InvalidAmount();

        totalSupply += _amount;
        balanceOf[_to] += _amount;

        emit Transfer(address(0), _to, _amount);
    }

    /**
     * @notice Burn tokens
     * @param _amount Amount to burn
     */
    function burn(uint256 _amount) external {
        if (_amount == 0) revert InvalidAmount();
        if (balanceOf[msg.sender] < _amount) revert InsufficientBalance();

        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;

        emit Transfer(msg.sender, address(0), _amount);
    }

    /**
     * @notice Transfer ownership
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        if (_newOwner == address(0)) revert ZeroAddress();

        address oldOwner = owner;
        owner = _newOwner;

        emit OwnershipTransferred(oldOwner, _newOwner);
    }
}
