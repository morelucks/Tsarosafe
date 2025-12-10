# Token Preference Feature Implementation

## Overview
This feature adds token preference settings to TsaroSafe groups, allowing users to specify whether groups accept CELO or G$ (GoodDollar) as contribution currency. Groups can be filtered by token type for discovery.

## Changes Made

### Smart Contracts (Solidity)

#### 1. **ITsaroSafeData.sol** - Interface Updates
- Added `TokenType` enum with two values:
  - `CELO` (0)
  - `GSTAR` (1)
- Updated `Group` struct to include `TokenType tokenType` field

#### 2. **TsaroSafe.sol** - Core Contract Updates
- Added `groupTokenTypes` mapping to track token type per group
- Updated `createGroup()` function signature:
  - New parameter: `ITsaroSafeData.TokenType _tokenType`
  - Stores token type in both `Group` struct and `groupTokenTypes` mapping
- Added `getGroupTokenType()` function:
  - Returns the token type for a specific group
- Added `getPublicGroupsByTokenType()` function:
  - Filters public groups by token type with pagination
  - Parameters: `TokenType _tokenType`, `uint256 _offset`, `uint256 _limit`
  - Returns: Array of `Group` structs matching the token type

#### 3. **TsaroSafe.t.sol** - Test Suite
- Updated all existing tests to include token type parameter
- Added 5 new comprehensive tests:
  - `testCreateGroupWithCELOToken()` - Verify CELO token creation
  - `testCreateGroupWithGSTARToken()` - Verify GSTAR token creation
  - `testGetGroupTokenType()` - Verify token type retrieval
  - `testFilterGroupsByTokenType()` - Verify filtering by token type
  - `testFilterGroupsByTokenTypeWithPagination()` - Verify pagination with filtering
- All 27 tests passing ✓

### Frontend (Next.js/React)

#### 1. **create-group/page.tsx** - Group Creation UI
- Added `TokenType` type definition (`"CELO" | "GSTAR"`)
- Updated `GroupSettings` interface to include `tokenType` field
- Added token type selection UI in Settings step:
  - Radio buttons for CELO and G$ (GoodDollar)
  - Descriptive labels for each option
- Updated review section to display selected token type
- Modified `handleSubmit()` to pass token type enum to contract

#### 2. **join-group/page.tsx** - Group Discovery UI
- Added `TokenType` type definition
- Updated `GroupRow` interface to include optional `tokenType` field
- Added token type filter dropdown:
  - "All Tokens" (default)
  - "CELO"
  - "G$ (GoodDollar)"
- Updated group filtering logic to filter by token type
- Enhanced group card display:
  - Added token type badge with color coding:
    - Yellow badge for CELO
    - Green badge for G$
  - Displays alongside privacy and member count

#### 3. **hooks/useTsaroSafe.ts** - Contract Interaction Hooks
- Updated `useCreateGroup()` hook:
  - Added `tokenType` parameter (default: 0 for CELO)
  - Passes token type to contract's `createGroup()` function
- Added `useGroupTokenType()` hook:
  - Retrieves token type for a specific group
  - Returns: `tokenType`, `isLoading`, `error`, `refetch`
- Added `usePublicGroupsByTokenType()` hook:
  - Filters public groups by token type
  - Parameters: `tokenType`, `offset`, `limit`
  - Returns: `groups`, `isLoading`, `error`, `refetch`

## Feature Capabilities

### For Group Creators
1. **Select Currency**: Choose between CELO or G$ when creating a group
2. **Display Preference**: Token preference is displayed in group details
3. **Immutable Setting**: Token type is set at group creation and cannot be changed

### For Group Members
1. **Filter by Currency**: Browse groups filtered by preferred token
2. **Visual Indicators**: See token type badges on group cards
3. **Informed Decisions**: Know which currency a group uses before joining

### Smart Contract Functions
- `createGroup(..., tokenType)` - Create group with token preference
- `getGroupTokenType(groupId)` - Get token type for a group
- `getPublicGroupsByTokenType(tokenType, offset, limit)` - Filter groups by token

## Testing

### Test Coverage
- ✓ Group creation with CELO token
- ✓ Group creation with GSTAR token
- ✓ Token type retrieval
- ✓ Filtering groups by token type
- ✓ Pagination with token type filtering
- ✓ All existing tests still passing (27/27)

### Test Results
```
Ran 2 test suites in 27.19ms (16.20ms CPU time): 27 tests passed, 0 failed, 0 skipped (27 total tests)
```

## Git Commits

1. **110563e** - `feat: add token preference setting for groups`
   - Smart contract implementation
   - Token type enum and struct updates
   - Filter and retrieval functions
   - Comprehensive test suite

2. **6960fdb** - `feat: add token preference UI to frontend`
   - Create group UI with token selection
   - Join group UI with token filtering
   - Hook implementations
   - Group card display updates

## Branch
- **Branch Name**: `feat/token-preference`
- **Base**: `feat-roster-order`

## Deployment Considerations

### Contract Upgrade
- The `createGroup()` function signature has changed
- Existing groups will not have a token type (will need migration if needed)
- New groups must specify a token type

### Frontend Compatibility
- Requires updated ABI with new function signatures
- Backward compatible with existing group queries
- New filtering functions available for discovery

## Future Enhancements

1. **Token Conversion**: Support automatic conversion between CELO and G$
2. **Multi-Token Groups**: Allow groups to accept multiple token types
3. **Token Swaps**: Integrate DEX for token swaps at contribution time
4. **Analytics**: Track contribution patterns by token type
5. **Governance**: Allow token type changes via DAO vote

## Files Modified

### Smart Contracts
- `contracts/src/interfaces/ITsaroSafeData.sol`
- `contracts/src/core/TsaroSafe.sol`
- `contracts/test/TsaroSafe.t.sol`

### Frontend
- `frontend/src/app/create-group/page.tsx`
- `frontend/src/app/join-group/page.tsx`
- `frontend/src/hooks/useTsaroSafe.ts`

## Verification Steps

1. ✓ Smart contracts compile without errors
2. ✓ All 27 tests pass
3. ✓ Frontend TypeScript has no diagnostics
4. ✓ Token type parameter properly passed through contract calls
5. ✓ UI displays token preferences correctly
6. ✓ Filtering logic works as expected
7. ✓ Git commits are clean and descriptive
