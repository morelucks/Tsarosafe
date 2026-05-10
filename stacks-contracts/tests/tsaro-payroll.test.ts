import { describe, it, expect, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

// ==========================================
// Test Suite: tsaro-payroll
// ==========================================

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;  // Company owner
const wallet2 = accounts.get('wallet_2')!;  // Manager
const wallet3 = accounts.get('wallet_3')!;  // Employee 1
const wallet4 = accounts.get('wallet_4')!;  // Employee 2
const wallet5 = accounts.get('wallet_5')!;  // Unauthorized user

// Role constants matching contract
const ROLE_ADMIN = 1;
const ROLE_MANAGER = 2;
const ROLE_VIEWER = 3;

describe('tsaro-payroll', () => {
  // ==========================================
  // Company Registration
  // ==========================================
  describe('Company Registration', () => {
    it('should register a new company successfully', () => {
      const result = simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      expect(result.result).toBeOk(Cl.uint(1));
    });

    it('should prevent duplicate company registration', () => {
      // First registration
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      // Duplicate attempt
      const result = simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp2'), Cl.principal(wallet1)],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(1001));
    });

    it('should return correct company details via get-company', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      const result = simnet.callReadOnlyFn(
        'tsaro-payroll',
        'get-company',
        [Cl.uint(1)],
        wallet1
      );
      expect(result.result).toBeSome(
        Cl.tuple({
          name: Cl.stringAscii('TsaroCorp'),
          owner: Cl.principal(wallet1),
          treasury: Cl.principal(wallet1),
          'employee-count': Cl.uint(0),
          'total-paid': Cl.uint(0),
          'created-at': Cl.uint(simnet.burnBlockHeight),
          active: Cl.bool(true),
        })
      );
    });

    it('should look up company by owner', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      const result = simnet.callReadOnlyFn(
        'tsaro-payroll',
        'get-company-by-owner',
        [Cl.principal(wallet1)],
        wallet1
      );
      expect(result.result).toBeSome(Cl.uint(1));
    });
  });

  // ==========================================
  // Role Management
  // ==========================================
  describe('Role Management', () => {
    it('should assign a manager role', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      const result = simnet.callPublicFn(
        'tsaro-payroll',
        'assign-role',
        [Cl.uint(1), Cl.principal(wallet2), Cl.uint(ROLE_MANAGER)],
        wallet1
      );
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it('should prevent non-admins from assigning roles', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      const result = simnet.callPublicFn(
        'tsaro-payroll',
        'assign-role',
        [Cl.uint(1), Cl.principal(wallet3), Cl.uint(ROLE_MANAGER)],
        wallet5
      );
      expect(result.result).toBeErr(Cl.uint(1000));
    });

    it('should revoke a role', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      simnet.callPublicFn(
        'tsaro-payroll',
        'assign-role',
        [Cl.uint(1), Cl.principal(wallet2), Cl.uint(ROLE_MANAGER)],
        wallet1
      );
      const result = simnet.callPublicFn(
        'tsaro-payroll',
        'revoke-role',
        [Cl.uint(1), Cl.principal(wallet2)],
        wallet1
      );
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it('should return correct role for a member', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      simnet.callPublicFn(
        'tsaro-payroll',
        'assign-role',
        [Cl.uint(1), Cl.principal(wallet2), Cl.uint(ROLE_VIEWER)],
        wallet1
      );
      const result = simnet.callReadOnlyFn(
        'tsaro-payroll',
        'get-role',
        [Cl.uint(1), Cl.principal(wallet2)],
        wallet1
      );
      expect(result.result).toBeSome(Cl.uint(ROLE_VIEWER));
    });
  });

  // ==========================================
  // Employee Management
  // ==========================================
  describe('Employee Management', () => {
    it('should add an employee', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      const result = simnet.callPublicFn(
        'tsaro-payroll',
        'add-employee',
        [
          Cl.uint(1),
          Cl.principal(wallet3),
          Cl.stringAscii('Alice'),
          Cl.uint(1000000),
        ],
        wallet1
      );
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it('should prevent duplicate employee', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      simnet.callPublicFn(
        'tsaro-payroll',
        'add-employee',
        [Cl.uint(1), Cl.principal(wallet3), Cl.stringAscii('Alice'), Cl.uint(1000000)],
        wallet1
      );
      const result = simnet.callPublicFn(
        'tsaro-payroll',
        'add-employee',
        [Cl.uint(1), Cl.principal(wallet3), Cl.stringAscii('Alice2'), Cl.uint(2000000)],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(1003));
    });

    it('should reject zero salary', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      const result = simnet.callPublicFn(
        'tsaro-payroll',
        'add-employee',
        [Cl.uint(1), Cl.principal(wallet3), Cl.stringAscii('Alice'), Cl.uint(0)],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(1005));
    });

    it('should update an employee salary', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      simnet.callPublicFn(
        'tsaro-payroll',
        'add-employee',
        [Cl.uint(1), Cl.principal(wallet3), Cl.stringAscii('Alice'), Cl.uint(1000000)],
        wallet1
      );
      const result = simnet.callPublicFn(
        'tsaro-payroll',
        'update-salary',
        [Cl.uint(1), Cl.principal(wallet3), Cl.uint(2000000)],
        wallet1
      );
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it('should deactivate an employee', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      simnet.callPublicFn(
        'tsaro-payroll',
        'add-employee',
        [Cl.uint(1), Cl.principal(wallet3), Cl.stringAscii('Alice'), Cl.uint(1000000)],
        wallet1
      );
      const result = simnet.callPublicFn(
        'tsaro-payroll',
        'deactivate-employee',
        [Cl.uint(1), Cl.principal(wallet3)],
        wallet1
      );
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it('should reactivate an employee', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      simnet.callPublicFn(
        'tsaro-payroll',
        'add-employee',
        [Cl.uint(1), Cl.principal(wallet3), Cl.stringAscii('Alice'), Cl.uint(1000000)],
        wallet1
      );
      simnet.callPublicFn(
        'tsaro-payroll',
        'deactivate-employee',
        [Cl.uint(1), Cl.principal(wallet3)],
        wallet1
      );
      const result = simnet.callPublicFn(
        'tsaro-payroll',
        'reactivate-employee',
        [Cl.uint(1), Cl.principal(wallet3)],
        wallet1
      );
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it('should prevent unauthorized users from adding employees', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      const result = simnet.callPublicFn(
        'tsaro-payroll',
        'add-employee',
        [Cl.uint(1), Cl.principal(wallet3), Cl.stringAscii('Alice'), Cl.uint(1000000)],
        wallet5
      );
      expect(result.result).toBeErr(Cl.uint(1000));
    });
  });

  // ==========================================
  // Payments
  // ==========================================
  describe('Payments', () => {
    it('should pay an employee with tsaro-token', () => {
      // Register company with deployer as treasury (deployer has the token supply)
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(deployer)],
        deployer
      );
      // Add employee
      simnet.callPublicFn(
        'tsaro-payroll',
        'add-employee',
        [Cl.uint(1), Cl.principal(wallet3), Cl.stringAscii('Alice'), Cl.uint(1000000)],
        deployer
      );
      // Pay the employee
      const result = simnet.callPublicFn(
        'tsaro-payroll',
        'pay-employee',
        [
          Cl.uint(1),
          Cl.principal(wallet3),
          Cl.uint(500000),
          Cl.stringAscii('May salary'),
          Cl.principal(`${deployer}.tsaro-token`),
        ],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(1));
    });

    it('should reject payment to inactive employee', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(deployer)],
        deployer
      );
      simnet.callPublicFn(
        'tsaro-payroll',
        'add-employee',
        [Cl.uint(1), Cl.principal(wallet3), Cl.stringAscii('Alice'), Cl.uint(1000000)],
        deployer
      );
      simnet.callPublicFn(
        'tsaro-payroll',
        'deactivate-employee',
        [Cl.uint(1), Cl.principal(wallet3)],
        deployer
      );
      const result = simnet.callPublicFn(
        'tsaro-payroll',
        'pay-employee',
        [
          Cl.uint(1),
          Cl.principal(wallet3),
          Cl.uint(500000),
          Cl.stringAscii('May salary'),
          Cl.principal(`${deployer}.tsaro-token`),
        ],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(1007));
    });

    it('should track payment history via get-payment', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(deployer)],
        deployer
      );
      simnet.callPublicFn(
        'tsaro-payroll',
        'add-employee',
        [Cl.uint(1), Cl.principal(wallet3), Cl.stringAscii('Alice'), Cl.uint(1000000)],
        deployer
      );
      simnet.callPublicFn(
        'tsaro-payroll',
        'pay-employee',
        [
          Cl.uint(1),
          Cl.principal(wallet3),
          Cl.uint(500000),
          Cl.stringAscii('May salary'),
          Cl.principal(`${deployer}.tsaro-token`),
        ],
        deployer
      );
      const result = simnet.callReadOnlyFn(
        'tsaro-payroll',
        'get-payment',
        [Cl.uint(1)],
        deployer
      );
      expect(result.result).toBeSome(
        Cl.tuple({
          'company-id': Cl.uint(1),
          employee: Cl.principal(wallet3),
          amount: Cl.uint(500000),
          'paid-at': Cl.uint(simnet.burnBlockHeight),
          memo: Cl.stringAscii('May salary'),
        })
      );
    });

    it('should increment the company payment count', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(deployer)],
        deployer
      );
      simnet.callPublicFn(
        'tsaro-payroll',
        'add-employee',
        [Cl.uint(1), Cl.principal(wallet3), Cl.stringAscii('Alice'), Cl.uint(1000000)],
        deployer
      );
      simnet.callPublicFn(
        'tsaro-payroll',
        'pay-employee',
        [
          Cl.uint(1),
          Cl.principal(wallet3),
          Cl.uint(500000),
          Cl.stringAscii('May salary'),
          Cl.principal(`${deployer}.tsaro-token`),
        ],
        deployer
      );
      const result = simnet.callReadOnlyFn(
        'tsaro-payroll',
        'get-payment-count',
        [Cl.uint(1)],
        deployer
      );
      expect(result.result).toBeUint(1);
    });
  });

  // ==========================================
  // Read-Only Helpers
  // ==========================================
  describe('Read-Only Helpers', () => {
    it('should correctly report is-admin', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      const adminCheck = simnet.callReadOnlyFn(
        'tsaro-payroll',
        'is-admin',
        [Cl.uint(1), Cl.principal(wallet1)],
        wallet1
      );
      expect(adminCheck.result).toBeBool(true);

      const nonAdminCheck = simnet.callReadOnlyFn(
        'tsaro-payroll',
        'is-admin',
        [Cl.uint(1), Cl.principal(wallet5)],
        wallet1
      );
      expect(nonAdminCheck.result).toBeBool(false);
    });

    it('should correctly report is-manager', () => {
      simnet.callPublicFn(
        'tsaro-payroll',
        'register-company',
        [Cl.stringAscii('TsaroCorp'), Cl.principal(wallet1)],
        wallet1
      );
      simnet.callPublicFn(
        'tsaro-payroll',
        'assign-role',
        [Cl.uint(1), Cl.principal(wallet2), Cl.uint(ROLE_MANAGER)],
        wallet1
      );
      const managerCheck = simnet.callReadOnlyFn(
        'tsaro-payroll',
        'is-manager',
        [Cl.uint(1), Cl.principal(wallet2)],
        wallet1
      );
      expect(managerCheck.result).toBeBool(true);
    });
  });
});
