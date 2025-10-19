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
    }

    // Savings Goals Structures
    struct SavingsGoal {
        uint256 id;
        string name;
        string description;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 deadline;
        bool isActive;
        uint256 createdAt;
        address owner;
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
}