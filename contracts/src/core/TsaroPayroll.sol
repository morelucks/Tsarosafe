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

    error ReentrancyGuardReentrantCall();
    error NotOwner();
    error NotEmployer();
    error NotEmployee();
    error CallerNotPayrollEmployer();
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
    error AlreadyEmployee();
    error EmployeeNotFound();
    error EmployeeNotActive();
    error SalaryZero();
    error EmployeeLimitExceeded();
    error PayPeriodNotElapsed();
    error InsufficientPoolBalance();
    error TransferFailed();
    error NothingToClaim();
    error AlreadyClaimed();

    enum TokenType { CELO, CUSD, GSTAR }
    enum PayPeriod  { Weekly, Biweekly, Monthly }

    struct Payroll {
        uint256   id;
        string    name;
        string    description;
        address   employer;
        TokenType tokenType;
        PayPeriod payPeriod;
        uint256   poolBalance;
        uint256   totalDisbursed;
        uint256   createdAt;
        uint256   lastRunAt;
        bool      isActive;
    }

    /// @notice Per-payroll employee record
    struct Employee {
        address wallet;
        string  name;
        uint256 salary;        // per-period salary in token's smallest unit
        uint256 totalReceived; // lifetime received
        uint256 lastPaidAt;    // timestamp of last payment
        bool    isActive;
        uint256 addedAt;
    }
}
