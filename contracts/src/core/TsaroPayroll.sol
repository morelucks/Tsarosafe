// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "forge-std/interfaces/IERC20.sol";

/**
 * @title TsaroPayroll
 * @notice Decentralized payroll contract for the TsaroSafe platform on Celo
 * @dev Enables employers to create payroll streams, register employees, fund
 *      payroll pools, and disburse salaries in CELO (native) or cUSD/G$ (ERC-20).
 *      Design mirrors TsaroSafe conventions:
 *        - Reentrancy guard (inline, no OZ dependency)
 *        - Custom errors
 *        - Multi-token support (CELO native + ERC-20)
 *        - Role separation: owner > employer > employee
 * @author TsaroSafe Team
 */
contract TsaroPayroll {

    // ============================================================
    //  Custom Errors — reentrancy
    // ============================================================

    error ReentrancyGuardReentrantCall();

    // Access control errors
    error NotOwner();
    error NotEmployer();
    error NotEmployee();
    error CallerNotPayrollEmployer();

    // Payroll validation errors
    error EmptyName();
    error NameTooLong();
    error DescriptionTooLong();
    error InvalidPayPeriod();
    error InvalidTokenAddress();
    error InvalidAmount();
    error PayrollNotExists();
    error PayrollNotActive();
    error PayrollAlreadyActive();
    error PayrollAlreadyFunded();

    // Employee validation errors
    error AlreadyEmployee();
    error EmployeeNotFound();
    error EmployeeNotActive();
    error SalaryZero();
    error EmployeeLimitExceeded();

    // Disbursement errors
    error PayPeriodNotElapsed();
    error InsufficientPoolBalance();
    error TransferFailed();
    error NothingToClaim();
    error AlreadyClaimed();

    // ============================================================
    //  Enums
    // ============================================================

    /// @notice Supported token types — mirrors ITsaroSafeData.TokenType
    enum TokenType {
        CELO,   // 0 — native CELO
        CUSD,   // 1 — Celo Dollar (ERC-20)
        GSTAR   // 2 — GoodDollar G$ (ERC-20)
    }

    /// @notice Pay-period cadence
    enum PayPeriod {
        Weekly,    // 0 — 7 days
        Biweekly,  // 1 — 14 days
        Monthly    // 2 — 30 days
    }
}
