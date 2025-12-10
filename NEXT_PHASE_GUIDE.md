# Next Phase: Smart Contract Integration & Testing

## Overview
This guide outlines the next steps to fully integrate the token preference and G$ contribution features with the smart contracts and test them end-to-end.

## Phase 1: Smart Contract Integration (Current)

### What's Been Done
✅ Token preference setting implemented in smart contracts
✅ G$ contribution UI implemented in frontend
✅ Approval flow implemented in frontend
✅ All tests passing (27/27)

### What Needs to Be Done

#### 1. **Update Smart Contract for G$ Token Transfers**
The current `makeContribution()` function only handles CELO. We need to:

**File**: `contracts/src/core/TsaroSafe.sol`

```solidity
// Add interface for ERC20 token
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Add mapping to track token addresses
mapping(uint256 => address) public groupTokenAddresses;

// Update makeContribution to handle both CELO and G$
function makeContribution(
    uint256 _groupId,
    uint256 _amount,
    string memory _description
) external payable groupExists(_groupId) onlyGroupMember(_groupId) groupActive(_groupId) {
    Group storage group = groups[_groupId];
    
    if (group.tokenType == TokenType.CELO) {
        // Handle CELO transfer (native token)
        require(msg.value == _amount, "Incorrect CELO amount");
    } else if (group.tokenType == TokenType.GSTAR) {
        // Handle G$ token transfer (ERC20)
        require(msg.value == 0, "Do not send CELO for G$ contributions");
        IERC20 gstarToken = IERC20(groupTokenAddresses[_groupId]);
        require(
            gstarToken.transferFrom(msg.sender, address(this), _amount),
            "G$ transfer failed"
        );
    }
    
    // Rest of the contribution logic...
}
```

#### 2. **Add Token Address Configuration**
Create a function to set token addresses for groups:

```solidity
function setGroupTokenAddress(uint256 _groupId, address _tokenAddress) 
    external 
    groupExists(_groupId) 
    onlyGroupCreator(_groupId) 
{
    require(_tokenAddress != address(0), "Invalid token address");
    groupTokenAddresses[_groupId] = _tokenAddress;
    emit GroupTokenAddressSet(_groupId, _tokenAddress);
}
```

#### 3. **Add Withdrawal Function**
Allow users to withdraw their contributions:

```solidity
function withdrawContribution(uint256 _groupId, uint256 _contributionId)
    external
    groupExists(_groupId)
    onlyGroupMember(_groupId)
{
    // Verify contribution belongs to user
    // Transfer tokens back to user
    // Update group totals
}
```

#### 4. **Add Tests for G$ Transfers**
Create new test file: `contracts/test/TsaroSafeGDollar.t.sol`

```solidity
contract TsaroSafeGDollarTest is Test {
    // Test G$ contribution
    function testMakeContributionWithGDollar() public {
        // Setup: Create G$ group
        // Setup: Approve G$ tokens
        // Execute: Make contribution
        // Assert: Contribution recorded
        // Assert: G$ transferred
    }
    
    // Test insufficient allowance
    function testMakeContributionWithInsufficientAllowance() public {
        // Should revert with "Insufficient allowance"
    }
    
    // Test withdrawal
    function testWithdrawContribution() public {
        // Setup: Make contribution
        // Execute: Withdraw
        // Assert: Tokens returned
    }
}
```

### Implementation Steps

1. **Install OpenZeppelin Contracts**
```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
```

2. **Update foundry.toml**
```toml
remappings = [
    "forge-std/=lib/forge-std/src/",
    "@openzeppelin/=lib/openzeppelin-contracts/contracts/"
]
```

3. **Update TsaroSafe.sol**
- Add IERC20 import
- Add token address mappings
- Update makeContribution() function
- Add setGroupTokenAddress() function
- Add withdrawal functions

4. **Create G$ Tests**
- Test G$ contributions
- Test approval flow
- Test withdrawals
- Test error cases

5. **Run Tests**
```bash
forge test -v
```

---

## Phase 2: Frontend-Contract Integration

### What Needs to Be Done

#### 1. **Update Contract ABI**
The frontend needs the updated ABI with new functions:
- `setGroupTokenAddress()`
- `withdrawContribution()`
- Updated `makeContribution()` with payable modifier

**File**: `frontend/src/lib/abi/TsaroSafe.json`

#### 2. **Update Hooks**
Create new hooks for G$ specific operations:

```typescript
// frontend/src/hooks/useTsaroSafe.ts

export function useSetGroupTokenAddress() {
  const contractAddress = useContractAddress()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const setTokenAddress = async (groupId: bigint, tokenAddress: Address) => {
    return writeContract({
      address: contractAddress as Address,
      abi: TsaroSafeABI,
      functionName: 'setGroupTokenAddress',
      args: [groupId, tokenAddress],
    })
  }

  return { setTokenAddress, hash, isPending, isConfirming, isConfirmed, error, isLoading: isPending || isConfirming }
}

export function useWithdrawContribution() {
  const contractAddress = useContractAddress()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const withdraw = async (groupId: bigint, contributionId: bigint) => {
    return writeContract({
      address: contractAddress as Address,
      abi: TsaroSafeABI,
      functionName: 'withdrawContribution',
      args: [groupId, contributionId],
    })
  }

  return { withdraw, hash, isPending, isConfirming, isConfirmed, error, isLoading: isPending || isConfirming }
}
```

#### 3. **Update Contribution Form**
Add withdrawal functionality to contribution history:

```typescript
// In frontend/src/app/group/[id]/page.tsx

// Add withdraw button to each contribution
{contributions.map((contribution) => (
  <div key={contribution.contributionId.toString()}>
    {/* Existing contribution display */}
    {address === contribution.member && (
      <button
        onClick={() => handleWithdraw(contribution.contributionId)}
        className="text-blue-600 hover:text-blue-800 text-sm"
      >
        Withdraw
      </button>
    )}
  </div>
))}
```

#### 4. **Update Group Creation**
Set token address when creating G$ group:

```typescript
// In frontend/src/app/create-group/page.tsx

const handleSubmit = async () => {
  // ... existing code ...
  
  // Create group
  await createGroup(...)
  
  // If G$ group, set token address
  if (settings.tokenType === "GSTAR") {
    const gstarAddress = getGoodDollarAddress(chain?.id)
    await setTokenAddress(groupId, gstarAddress)
  }
}
```

---

## Phase 3: End-to-End Testing

### Manual Testing Checklist

#### Test 1: Create CELO Group
- [ ] Navigate to create group
- [ ] Select CELO token
- [ ] Create group
- [ ] Verify group shows CELO badge

#### Test 2: Create G$ Group
- [ ] Navigate to create group
- [ ] Select G$ token
- [ ] Create group
- [ ] Verify group shows G$ badge
- [ ] Verify token address is set

#### Test 3: Contribute CELO
- [ ] Join CELO group
- [ ] Make CELO contribution
- [ ] Verify contribution appears with CELO badge
- [ ] Verify CELO transferred to contract

#### Test 4: Contribute G$ (First Time)
- [ ] Join G$ group
- [ ] Make G$ contribution
- [ ] Verify approval is requested
- [ ] Approve G$ tokens
- [ ] Verify contribution is submitted
- [ ] Verify contribution appears with G$ badge
- [ ] Verify G$ transferred to contract

#### Test 5: Contribute G$ (Subsequent)
- [ ] Make another G$ contribution
- [ ] Verify no approval needed (if allowance sufficient)
- [ ] Verify contribution submitted directly

#### Test 6: Withdraw Contribution
- [ ] Make a contribution
- [ ] Click withdraw button
- [ ] Verify withdrawal transaction
- [ ] Verify tokens returned to wallet
- [ ] Verify contribution removed from history

#### Test 7: Filter Groups by Token
- [ ] Go to join group page
- [ ] Filter by CELO
- [ ] Verify only CELO groups shown
- [ ] Filter by G$
- [ ] Verify only G$ groups shown

#### Test 8: Error Cases
- [ ] Try to contribute without approval (G$)
- [ ] Try to contribute with insufficient balance
- [ ] Try to contribute with insufficient allowance
- [ ] Try to withdraw someone else's contribution

### Automated Testing

```bash
# Run all tests
cd contracts
forge test -v

# Run specific test file
forge test test/TsaroSafeGDollar.t.sol -v

# Run with gas report
forge test --gas-report

# Run with coverage
forge coverage
```

---

## Phase 4: Deployment

### Testnet Deployment (Celo Alfajores)

1. **Deploy Smart Contracts**
```bash
cd contracts
forge script script/DeployTsaroSafe.s.sol:DeployTsaroSafeScript \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --private-key $PRIVATE_KEY \
  --broadcast
```

2. **Update Frontend Configuration**
- Update contract address in `frontend/src/lib/constants.ts`
- Update ABI in `frontend/src/lib/abi/TsaroSafe.json`

3. **Deploy Frontend**
```bash
cd frontend
npm run build
npm run start
```

4. **Test on Testnet**
- Create groups with both token types
- Make contributions
- Test approval flow
- Test withdrawals

### Mainnet Deployment (Celo Mainnet)

1. **Audit Smart Contracts**
- Security review
- Gas optimization
- Edge case testing

2. **Deploy to Mainnet**
```bash
forge script script/DeployTsaroSafe.s.sol:DeployTsaroSafeScript \
  --rpc-url https://forno.celo.org \
  --private-key $PRIVATE_KEY \
  --broadcast
```

3. **Update Frontend**
- Update contract addresses
- Update RPC endpoints
- Deploy to production

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Smart Contract Integration | 2-3 days | 🔄 In Progress |
| Frontend Integration | 1-2 days | ⏳ Pending |
| Testing & QA | 2-3 days | ⏳ Pending |
| Testnet Deployment | 1 day | ⏳ Pending |
| Mainnet Deployment | 1 day | ⏳ Pending |

---

## Resources

### Documentation
- [OpenZeppelin ERC20](https://docs.openzeppelin.com/contracts/4.x/erc20)
- [Celo Documentation](https://docs.celo.org/)
- [GoodDollar Documentation](https://docs.gooddollar.org/)
- [Foundry Book](https://book.getfoundry.sh/)

### Useful Commands
```bash
# Check contract size
forge build --sizes

# Get contract ABI
forge inspect TsaroSafe abi

# Estimate gas
forge test --gas-report

# Format code
forge fmt

# Lint code
solhint 'contracts/**/*.sol'
```

---

## Next Steps

1. **Start Phase 1**: Update smart contracts for G$ transfers
2. **Create tests**: Write comprehensive tests for G$ functionality
3. **Run tests**: Ensure all tests pass
4. **Update frontend**: Integrate new contract functions
5. **End-to-end testing**: Test complete workflows
6. **Deploy to testnet**: Test on Celo Alfajores
7. **Deploy to mainnet**: Launch to production

---

## Questions & Support

For questions about:
- **Smart Contracts**: See `contracts/` directory
- **Frontend**: See `frontend/src/` directory
- **Testing**: See `contracts/test/` directory
- **Deployment**: See deployment scripts in `contracts/script/`

Good luck! 🚀
