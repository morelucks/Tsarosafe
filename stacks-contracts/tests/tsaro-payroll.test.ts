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
