// Type definitions for GoodDollar UBI claiming
export interface UBIClaimInfo {
  claimableAmount: bigint;
  nextClaimTime: bigint;
  canClaim: boolean;
  dailyUBI: bigint;
}

export interface UBIClaimResult {
  success: boolean;
  amount: bigint;
  transactionHash?: string;
  error?: string;
}