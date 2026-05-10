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
