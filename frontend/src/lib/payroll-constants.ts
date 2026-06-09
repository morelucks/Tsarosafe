/**
 * Stacks Payroll Contract and Network Configurations
 */

export const PAYROLL_CONTRACT_ADDRESSES = {
  // Stacks Mainnet
  mainnet: 'SP34MN3DMM07BNAWYJSHTS4B08T8JRVK8AT810X1B',
  // Stacks Testnet
  testnet: 'SP34MN3DMM07BNAWYJSHTS4B08T8JRVK8AT810X1B', // Using same for demo/fallback or update as needed
  // Stacks Devnet / Mock
  devnet: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
} as const;

export const PAYROLL_CONTRACT_NAME = 'tsaro-payroll';

export const STACKS_NETWORKS = {
  mainnet: 'https://api.mainnet.hiro.so',
  testnet: 'https://api.testnet.hiro.so',
  devnet: 'http://localhost:3999',
} as const;

export const ROLE_NAMES = {
  1: 'Admin',
  2: 'Manager',
  3: 'Viewer',
} as const;

export const ERROR_CODES: Record<number, string> = {
  1000: 'Not Authorized',
  1001: 'Company Already Exists',
  1002: 'Company Not Found',
  1003: 'Employee Already Exists',
  1004: 'Employee Not Found',
  1005: 'Invalid Amount',
  1006: 'Insufficient Balance',
  1007: 'Employee Inactive',
  1008: 'Already Paid',
  1009: 'Invalid Role',
  1010: 'Max Employees Reached',
  1011: 'Payment Failed',
};
