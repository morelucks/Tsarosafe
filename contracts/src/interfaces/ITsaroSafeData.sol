// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ITsaroSafeData
 * @notice Interface for core data structures used across TsaroSafe modules
 */
interface ITsaroSafeData {
    // Group Management Structures
    struct Group {
        uint256 id;
        string name;
        string description;
        bool isPrivate;
        address creator;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 memberLimit;
        uint256 createdAt;
        uint256 endDate;
        bool isActive;
        bool isCompleted;
    }

    struct Member {
        address user;
        uint256 contribution;
        uint256 lastContribution;
        bool isActive;
        uint256 joinedAt;
    }

    struct Contribution {
        address member;
        uint256 amount;
        uint256 timestamp;
        string description;
        bool isVerified;
    }

    struct ContributionHistory {
        uint256 contributionId;
        address member;
        uint256 groupId;
        uint256 amount;
        uint256 timestamp;
        string description;
        bool isVerified;
    }

    struct GroupContributionSummary {
        uint256 groupId;
        uint256 totalContributions;
        uint256 totalAmount;
        uint256 memberCount;
        uint256 lastContributionTime;
        mapping(address => uint256) memberContributions;
    }

    // Goal Setting Structures
    struct GroupGoal {
        uint256 groupId;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 deadline;
        bool isCompleted;
        uint256 createdAt;
        uint256 completedAt;
        uint256 progressPercentage;
    }

    struct GoalMilestone {
        uint256 milestoneId;
        uint256 groupId;
        uint256 targetAmount;
        string description;
        bool isReached;
        uint256 reachedAt;
        uint256 createdAt;
    }

    struct GoalProgress {
        uint256 groupId;
        uint256 currentAmount;
        uint256 targetAmount;
        uint256 progressPercentage;
        uint256 daysRemaining;
        uint256 averageDailyContribution;
        bool isOnTrack;
    }

    // Investment Portfolio Structures
    struct InvestmentPortfolio {
        address owner;
        uint256 totalInvested;
        uint256 totalWithdrawn;
        uint256 currentBalance;
        uint256[] goalIds;
        uint256[] groupIds;
        uint256 lastUpdated;
    }

    struct ProgressSnapshot {
        uint256 timestamp;
        uint256 totalSavings;
        uint256 totalInvestments;
        uint256 activeGoals;
        uint256 completedGoals;
    }

    // Round payment helper function signatures
    function isMemberPaid(uint256 groupId, uint256 roundId, address member) external view returns (bool);
    function getRoundPaymentStatuses(uint256 groupId, uint256 roundId)
        external
        view
        returns (address[] memory, bool[] memory);
    function getRoundPaidCount(uint256 groupId, uint256 roundId) external view returns (uint256);
    function getActiveRound(uint256 groupId) external view returns (uint256);
    function setActiveRound(uint256 groupId, uint256 roundId) external;
}

