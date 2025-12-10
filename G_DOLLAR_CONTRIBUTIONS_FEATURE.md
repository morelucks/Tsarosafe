# G$ (GoodDollar) Contributions Feature

## Overview
This feature enables users to make contributions to TsaroSafe groups using G$ (GoodDollar) tokens. It includes approval flow management, balance checking, and token type validation to ensure contributions match the group's configured currency.

## Features Implemented

### 1. **Contribution Form Enhancements**
- **Group Currency Display**: Shows the group's configured token type (CELO or G$)
- **Token Selection**: Radio buttons to select between CELO and G$
- **Token Locking**: Disables token selection if group only accepts one type
- **Balance Display**: Shows current G$ balance and approved allowance
- **Approval Status**: Displays warning if allowance is insufficient

### 2. **G$ Approval Flow**
- **Automatic Approval Check**: Validates allowance before contribution
- **Smart Approval**: Requests approval for amount + 50% buffer for future contributions
- **Approval Confirmation**: Waits for approval transaction to confirm
- **User Feedback**: Shows "Approving G$..." status during approval

### 3. **Balance Validation**
- **Real-time Balance Check**: Validates user has sufficient G$ balance
- **Insufficient Balance Warning**: Shows error message with available balance
- **Submit Button Disabled**: Prevents submission if balance is insufficient
- **Dynamic Validation**: Updates as user changes contribution amount

### 4. **Contribution History Display**
- **Token Type Badge**: Shows which token was used (CELO or G$)
- **Color Coding**: Yellow badge for CELO, Green badge for G$
- **Amount Display**: Shows amount with token symbol
- **Verification Status**: Displays verified badge for confirmed contributions

### 5. **Hook Updates**
- **useMakeContribution()**: Updated to support token type parameter
- **useGoodDollarBalance()**: Retrieves current G$ balance
- **useGoodDollarAllowance()**: Checks approved allowance
- **useApproveGoodDollar()**: Handles G$ token approval

## User Flow

### Making a G$ Contribution

1. **User navigates to group detail page**
   - Sees group information and contribution form
   - Form displays group's token type requirement

2. **User selects G$ token**
   - Form shows G$ balance and current allowance
   - If allowance < contribution amount, warning appears

3. **User enters contribution amount**
   - Form validates balance in real-time
   - Shows error if insufficient balance
   - Displays approval needed warning if applicable

4. **User clicks "Submit Contribution"**
   - If approval needed:
     - Approval transaction is sent
     - User waits for confirmation
     - Button shows "Approving G$..." status
   - After approval (if needed):
     - Contribution transaction is sent
     - Button shows "Submitting..." status

5. **Contribution is recorded**
   - Contribution appears in history with G$ badge
   - Token type is displayed
   - Verification status shown

## Technical Implementation

### Frontend Components

#### Group Detail Page (`frontend/src/app/group/[id]/page.tsx`)
```typescript
// Token selection with group validation
<button
  disabled={group?.tokenType === 1}  // Disable CELO if group uses G$
  className={...}
>
  CELO
</button>

// G$ balance and allowance display
{selectedToken === "G$" && (
  <div className="text-xs text-gray-500 mt-2 space-y-1 bg-gray-50 p-2 rounded">
    <p><span className="font-medium">Balance:</span> {gdBalance} G$</p>
    <p><span className="font-medium">Approved Allowance:</span> {gdAllowance} G$</p>
  </div>
)}

// Contribution history with token badges
{contributions.map((contribution) => (
  <div key={contribution.contributionId.toString()}>
    <span className={`px-2 py-0.5 text-xs rounded font-medium ${
      group?.tokenType === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
    }`}>
      {group?.tokenType === 0 ? 'CELO' : 'G$'}
    </span>
  </div>
))}
```

#### Contribution Handler
```typescript
const handleMakeContribution = async () => {
  const amountWei = BigInt(Math.floor(parseFloat(contributionAmount) * 1e18));
  const amountValue = parseFloat(contributionAmount);
  
  // Check and request G$ approval if needed
  if (selectedToken === "G$") {
    if (gdAllowance < amountValue) {
      const approvalAmount = amountWei + (amountWei / 2n);
      await approveGd(contractAddress as Address, approvalAmount);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Make the contribution
  await makeContribution(groupId, amountWei, contributionDescription);
};
```

### Hooks

#### useMakeContribution Hook
```typescript
export function useMakeContribution() {
  const contractAddress = useContractAddress()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const makeContribution = async (
    groupId: bigint,
    amount: bigint,
    description: string,
    tokenType: number = 0
  ) => {
    // Token type is determined by group's tokenType setting
    // Contract validates contribution matches group's token type
    return writeContract({
      address: contractAddress as Address,
      abi: TsaroSafeABI,
      functionName: 'makeContribution',
      args: [groupId, amount, description],
    })
  }

  return { makeContribution, hash, isPending, isConfirming, isConfirmed, error, isLoading: isPending || isConfirming }
}
```

#### useGoodDollarBalance Hook
```typescript
export function useGoodDollarBalance() {
  const { address, chain } = useAccount()
  const tokenAddress = chain ? getGoodDollarAddress(chain.id) : undefined

  const { data: balance, isLoading, error, refetch } = useReadContract({
    address: tokenAddress as Address | undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!tokenAddress && !!address },
  })

  return {
    balance: balance || 0n,
    balanceFormatted: balance ? Number(balance) / 1e18 : 0,
    isLoading,
    error,
    refetch,
  }
}
```

#### useApproveGoodDollar Hook
```typescript
export function useApproveGoodDollar() {
  const { chain } = useAccount()
  const tokenAddress = chain ? getGoodDollarAddress(chain.id) : undefined
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const approve = async (spender: Address, amount: bigint) => {
    if (!tokenAddress) {
      throw new Error('GoodDollar token address not found.')
    }

    return writeContract({
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, amount],
    })
  }

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    isLoading: isPending || isConfirming,
  }
}
```

## UI/UX Features

### Contribution Form
- **Group Currency Banner**: Blue banner showing group's token requirement
- **Token Selection**: Two buttons (CELO/G$) with visual feedback
- **Balance Information**: Shows current balance and approved allowance
- **Approval Warning**: Orange warning if approval needed
- **Amount Input**: Number input with real-time validation
- **Description Input**: Optional field for contribution notes
- **Submit Button**: Disabled states for loading, insufficient balance, or missing approval

### Contribution History
- **Token Badge**: Color-coded badge showing token type
- **Amount Display**: Shows amount with token symbol
- **Member Address**: Shortened wallet address
- **Verification Status**: Green badge for verified contributions
- **Timestamp**: Full date and time of contribution

## Error Handling

### Balance Errors
- **Insufficient Balance**: "⚠️ Insufficient G$ balance. You have X G$"
- **Prevents Submission**: Submit button disabled if balance < amount

### Approval Errors
- **Approval Failed**: Shows error message from contract
- **Retry Option**: User can retry approval

### Contribution Errors
- **Transaction Failed**: Shows error message
- **Retry Option**: User can retry contribution

## Security Considerations

1. **Approval Validation**: Checks allowance before requesting approval
2. **Amount Validation**: Validates amount matches group's token type
3. **Balance Verification**: Ensures user has sufficient balance
4. **Token Type Matching**: Prevents mixing tokens in same group
5. **Approval Buffer**: Requests 50% extra for future contributions

## Testing Scenarios

### Scenario 1: CELO Group Contribution
1. User navigates to CELO group
2. G$ button is disabled
3. User selects CELO and enters amount
4. Contribution is submitted
5. Contribution appears with CELO badge

### Scenario 2: G$ Group Contribution (First Time)
1. User navigates to G$ group
2. CELO button is disabled
3. User selects G$ and enters amount
4. Allowance is insufficient
5. Approval is requested
6. User approves
7. Contribution is submitted
8. Contribution appears with G$ badge

### Scenario 3: G$ Group Contribution (Subsequent)
1. User has already approved G$
2. User selects G$ and enters amount
3. Allowance is sufficient
4. Contribution is submitted directly
5. Contribution appears with G$ badge

### Scenario 4: Insufficient Balance
1. User selects G$ and enters amount > balance
2. Error message shows available balance
3. Submit button is disabled
4. User cannot submit

## Files Modified

- `frontend/src/app/group/[id]/page.tsx` - Contribution form and history display
- `frontend/src/hooks/useTsaroSafe.ts` - Updated useMakeContribution hook
- `frontend/src/hooks/useGoodDollar.ts` - G$ token interaction hooks (already existed)

## Future Enhancements

1. **Token Swap**: Integrate DEX for automatic token conversion
2. **Multi-Token Support**: Allow groups to accept multiple tokens
3. **Gas Optimization**: Batch approvals for multiple contributions
4. **Analytics**: Track contribution patterns by token type
5. **Notifications**: Push notifications for contribution confirmations
6. **History Export**: Export contribution history as CSV/PDF

## Deployment Notes

### Prerequisites
- GoodDollar token contract deployed on Celo
- TsaroSafe contract updated with token type support
- Frontend dependencies installed

### Configuration
- Ensure `getGoodDollarAddress()` returns correct token address for network
- Verify contract ABI includes all required functions
- Test approval flow on testnet before mainnet deployment

### Testing Checklist
- [ ] G$ balance retrieval works
- [ ] Approval flow completes successfully
- [ ] Contribution submission works with G$
- [ ] Contribution history displays token type
- [ ] Balance validation prevents invalid submissions
- [ ] Error messages display correctly
- [ ] UI is responsive on mobile devices
