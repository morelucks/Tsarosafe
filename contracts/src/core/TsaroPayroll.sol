// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "forge-std/interfaces/IERC20.sol";

/**
 * @title TsaroPayroll
 * @notice Decentralized payroll contract for the TsaroSafe platform on Celo
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

    struct Employee {
        address wallet;
        string  name;
        uint256 salary;
        uint256 totalReceived;
        uint256 lastPaidAt;
        bool    isActive;
        uint256 addedAt;
    }

    /// @notice Immutable record written for every salary payment
    struct PaymentRecord {
        uint256 payrollId;
        address employee;
        uint256 amount;
        uint8   tokenType;
        uint256 timestamp;
        uint256 periodIndex; // sequential pay-period counter
    }
}
