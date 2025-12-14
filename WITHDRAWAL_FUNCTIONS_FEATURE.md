# Withdrawal Functions Feature

## Overview
This feature implements secure withdrawal functionality for TsaroSafe, allowing members to withdraw their contributions from groups after the group has ended or been completed. The implementation includes comprehensive access control, validation, and support for both CELO and G$ tokens.

## Features Implemented

### 1. **Core Withdrawal Function**
```solidity
function withdrawContribution(uint256 _groupId, uint256 _contributionId) external
```
- Allows members to withdraw their contributions
- Validates contribution ownership
- Prevents double withdrawals
- Supports both CELO and G$ tokens
- Updates group totals and member tracking

### 2. **Access Control & Validation**
- Only group members can withdraw
- Only contribution owner can withdraw their contribution
- Withdrawal only allowed after group ends or is completed
- Prevents withdrawing already-withdrawn contributions
- Validates token addresses are configured

### 3. **Withdrawal Tracking**
- `withdrawnContributions` mapping tracks withdrawn status
- `memberWithdrawnAmount` mapping tracks total withdrawn per member
- Prevents double withdrawals with `ContributionAlreadyWithdrawn` error

### 4. **Query Functions**
- `getMemberWithdrawnAmount()` - Get total withdrawn by member
- `isContributionWithdrawn()` - Check if contribution was withdrawn
- `getWithdrawableAmount()` - Calculate available withdrawal amount

### 5. **Token Support**
- **CELO**: Native token transfer via low-level call
- **G$**: ERC20 token transfer via IERC20.transfer()
- Automatic token type detection from contribution history

## Error Handling

### Custom Errors
- `WithdrawalNotAllowed` - Withdrawal attempted while group is active
- `ContributionAlreadyWithdrawn` - Attempting to withdraw twice
- `InsufficientContractBalance` - Contract doesn't have enough CELO
- `WithdrawalFailed` - CELO transfer failed
- `InvalidTokenAddress` - Token address not configured
- `TokenTransferFailed` - ERC20 transfer failed
- `ContributionNotFound` - Contribution ID doesn't exist
- `NotMember` - Caller is not contribution owner

## Events

### WithdrawalCompleted
```solidity
event WithdrawalCompleted(
    uint256 indexed groupId,
    uint256 indexed contributionId,
    address indexed member,
    uint256 amount,
    uint8 tokenType,
    uint256 timestamp
);
```

## Test Coverage

### Test Cases (5 new tests)
1. **testWithdrawContributionAfterGroupEnds**
   - Verifies successful withdrawal after group ends
   - Checks CELO transfer
   - Validates withdrawal tracking

2. **testWithdrawalNotAllowedWhileGroupActive**
   - Ensures withdrawal fails while group is active
   - Validates `WithdrawalNotAllowed` error

3. **testCannotWithdrawTwice**
   - Prevents double withdrawals
   - Validates `ContributionAlreadyWithdrawn` error

4. **testGetWithdrawableAmount**
   - Calculates correct withdrawable amount
   - Handles multiple contributions

5. **testMemberWithdrawnAmountTracking**
   - Verifies withdrawn amount tracking
   - Validates `getMemberWithdrawnAmount()` function

### Test Results
- Total Tests: 37/37 passing ✅
- New Withdrawal Tests: 5/5 passing ✅
- Existing Tests: 32/32 still passing ✅

## Implementation Details

### Withdrawal Flow
1. Member calls `withdrawContribution()` with group ID and contribution ID
2. Contract finds the contribution in history
3. Validates:
   - Contribution exists
   - Caller is the contribution owner
   - Contribution hasn't been withdrawn
   - Group has ended or is completed
4. Marks contribution as withdrawn
5. Updates member's withdrawn amount
6. Reduces group's current amount
7. Transfers tokens back to member
8. Emits `WithdrawalCompleted` event

### Token Transfer Mechanism
- **CELO**: Uses low-level call with value transfer
  ```solidity
  (bool success, ) = msg.sender.call{value: withdrawalAmount}("");
  ```
- **G$**: Uses ERC20 transfer
  ```solidity
  IERC20(goodDollarAddress).transfer(msg.sender, withdrawalAmount);
  ```

### Receive Function
```solidity
receive() external payable {}
```
Allows contract to accept CELO transfers for withdrawal operations.

## Security Considerations

1. **Access Control**: Only contribution owner can withdraw their contribution
2. **Double Withdrawal Prevention**: Marked contributions cannot be withdrawn again
3. **Timing Validation**: Withdrawals only allowed after group ends
4. **Balance Validation**: Checks contract has sufficient balance before transfer
5. **Token Validation**: Verifies token addresses are configured
6. **Transfer Safety**: Uses low-level call for CELO with proper error handling

## Gas Optimization

- Uses custom errors instead of strings (saves gas)
- Efficient mapping lookups for withdrawal tracking
- Single loop to find contribution
- Minimal state updates

## Future Enhancements

1. **Partial Withdrawals**: Allow withdrawing portion of contribution
2. **Withdrawal Fees**: Implement optional withdrawal fees
3. **Withdrawal Delays**: Add time-lock for withdrawals
4. **Batch Withdrawals**: Allow withdrawing multiple contributions at once
5. **Withdrawal Limits**: Implement daily/weekly withdrawal limits
6. **Withdrawal Approvals**: Add approval mechanism for large withdrawals

## Files Modified

- `contracts/src/core/TsaroSafe.sol` - Added withdrawal functions and tracking
- `contracts/test/TsaroSafe.t.sol` - Added 5 comprehensive withdrawal tests

## Git Commit

- `6e1aa44` - feat: implement withdrawal functions with access control

## Time Estimate

- Implementation: 2 hours
- Testing: 1 hour
- Documentation: 1 hour
- **Total: 4 hours** (within 4-6 hour estimate)
