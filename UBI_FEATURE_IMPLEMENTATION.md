# GoodDollar UBI Claiming Feature

## Overview
This feature integrates GoodDollar's Universal Basic Income (UBI) claiming functionality into the TsaroSafe dashboard, allowing users to claim their daily G$ allocation directly from the application.

## Features Implemented

### 1. UBI Claiming Hooks (`/hooks/useGoodDollar.ts`)
- **`useUBIClaimInfo()`**: Fetches claimable amount, next claim time, and daily UBI allocation
- **`useClaimUBI()`**: Handles UBI claim transactions with proper error handling
- Real-time data updates with 30-second refresh intervals
- Support for Celo Mainnet and Alfajores testnet

### 2. UBI Claim Component (`/components/UBIClaim.tsx`)
- Interactive claim button with loading states
- Real-time countdown timer for next claim availability
- Transaction status feedback and error handling
- Responsive design matching GoodDollar branding
- Auto-refresh balance after successful claims

### 3. Dashboard Integration (`/app/dashboard/page.tsx`)
- UBI stats card showing claimable amount with dynamic styling
- Side-by-side layout with GoodDollar balance
- UBI quick action in dashboard actions grid
- Visual indicators for available claims

### 4. Error Handling & User Experience
- Comprehensive error messages for common scenarios
- Transaction confirmation prompts
- Success notifications with auto-dismiss
- Graceful handling of network issues and wallet rejections

## Technical Implementation

### Contract Integration
- **UBI Contract Address**: `0x495d133B938596C9984d462F007B676bDc57eCEC`
- **Functions Used**:
  - `claim()`: Claims available UBI
  - `checkEntitlement(address)`: Gets claimable amount
  - `nextClaimTime(address)`: Gets next claim timestamp
  - `dailyUbi()`: Gets daily UBI allocation amount

### Data Flow
1. Component loads and fetches UBI claim info
2. Real-time countdown updates every second
3. User clicks claim button when eligible
4. Transaction is submitted to blockchain
5. Success/error feedback is displayed
6. Balance is refreshed automatically

### Security Considerations
- All transactions require user wallet confirmation
- Contract calls are read-only except for claiming
- Proper error handling for insufficient gas fees
- Rate limiting through contract-enforced claim intervals

## Usage Instructions

### For Users
1. Connect your wallet to the TsaroSafe dashboard
2. View your UBI status in the green UBI card
3. Click "Claim UBI" when available (typically daily)
4. Confirm the transaction in your wallet
5. Your G$ balance will update automatically

### For Developers
```typescript
// Use UBI claim info
const { claimableAmountFormatted, canClaim, timeUntilNextClaim } = useUBIClaimInfo();

// Claim UBI
const { claimUBI, isLoading, isConfirmed, error } = useClaimUBI();
await claimUBI();
```

## Configuration

### Network Support
- **Celo Mainnet (42220)**: Full UBI functionality
- **Celo Alfajores (44787)**: Testnet support (if UBI contract deployed)

### Contract Addresses
```typescript
const UBI_CONTRACT_ADDRESSES = {
  42220: '0x495d133B938596C9984d462F007B676bDc57eCEC', // Mainnet
  44787: '0x495d133B938596C9984d462F007B676bDc57eCEC', // Testnet
}
```

## Future Enhancements
- UBI claiming history and analytics
- Notification system for available claims
- Integration with savings goals (auto-contribute UBI)
- Multi-language support for UBI explanations
- Advanced UBI statistics and trends

## Dependencies
- `wagmi` for blockchain interactions
- `viem` for Ethereum utilities
- React hooks for state management
- TailwindCSS for styling

## Testing
- Test UBI claiming on Celo testnet
- Verify error handling for edge cases
- Confirm UI responsiveness across devices
- Validate transaction flow end-to-end