// Type definitions for TsaroSafe groups
export interface Group {
  id: bigint;
  name: string;
  description: string;
  isPrivate: boolean;
  creator: string;
  targetAmount: bigint;
  currentAmount: bigint;
  memberLimit: bigint;
  createdAt: bigint;
  endDate: bigint;
  isActive: boolean;
  isCompleted: boolean;
  tokenType: number; // 0 = CELO, 1 = GSTAR
}

export interface ContributionHistory {
  contributionId: bigint;
  member: string;
  groupId: bigint;
  amount: bigint;
  timestamp: bigint;
  description: string;
  isVerified: boolean;
  tokenType: number; // 0 = CELO, 1 = GSTAR
}

export interface GroupMilestone {
  milestoneId: bigint;
  groupId: bigint;
  targetAmount: bigint;
  description: string;
  isReached: boolean;
  reachedAt: bigint;
  createdAt: bigint;
}

export interface GroupStats {
  memberCount: bigint;
  currentAmount: bigint;
  targetAmount: bigint;
  progressPercentage: bigint;
  isActive: boolean;
  isCompleted: boolean;
}