import {
  uintCV,
  principalCV,
  stringAsciiCV,
  contractPrincipalCV,
  standardPrincipalCV,
  cvToJSON,
  hexToCV,
  ClarityType,
  serializeCV,
} from '@stacks/transactions';
import {
  PAYROLL_CONTRACT_ADDRESSES,
  PAYROLL_CONTRACT_NAME,
  STACKS_NETWORKS,
} from './payroll-constants';
import { Company, Employee, PaymentRecord, UserRole } from '@/types/payroll';

// Helper to determine network name and endpoint
const getContractInfo = (networkName: 'mainnet' | 'testnet' | 'devnet') => {
  const address = PAYROLL_CONTRACT_ADDRESSES[networkName];
  const endpoint = STACKS_NETWORKS[networkName];
  return { address, name: PAYROLL_CONTRACT_NAME, endpoint };
};

// Generic read-only call helper
async function callReadOnly(
  networkName: 'mainnet' | 'testnet' | 'devnet',
  functionName: string,
  args: any[]
): Promise<any> {
  const { address, name, endpoint } = getContractInfo(networkName);
  const url = `${endpoint}/v2/contracts/call-read/${address}/${name}/${functionName}`;

  // Serialize args to hex strings
  const serializedArgs = args.map((arg) => {
    const buffer = serializeCV(arg);
    return Array.from(buffer)
      .map((b) => Number(b).toString(16).padStart(2, '0'))
      .join('');
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: address, // run as contract address
      arguments: serializedArgs,
    }),
  });

  if (!response.ok) {
    throw new Error(`Read-only call failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.okay && data.result) {
    const cv = hexToCV(data.result);
    return cvToJSON(cv);
  }
  
  throw new Error('Read-only execution failed');
}

/**
 * Read-Only Queries
 */

// Get company ID by owner
export async function getCompanyIdByOwner(
  networkName: 'mainnet' | 'testnet' | 'devnet',
  ownerAddress: string
): Promise<number | null> {
  try {
    const res = await callReadOnly(networkName, 'get-company-by-owner', [
      principalCV(ownerAddress),
    ]);
    if (res && res.type === 'some' || (res.value && res.value.type !== 'none')) {
      // Clarity Option types in JSON representation
      const valObj = res.value;
      if (valObj && valObj.value !== undefined) {
        return parseInt(valObj.value);
      }
    }
    // Return null if none
    return null;
  } catch (err) {
    console.error('Error in getCompanyIdByOwner:', err);
    return null;
  }
}

// Get company details by ID
export async function getCompanyDetails(
  networkName: 'mainnet' | 'testnet' | 'devnet',
  companyId: number
): Promise<Company | null> {
  try {
    const res = await callReadOnly(networkName, 'get-company', [
      uintCV(companyId),
    ]);
    
    if (res && res.value && res.value.value) {
      const companyVal = res.value.value;
      return {
        id: companyId,
        name: companyVal.name.value,
        owner: companyVal.owner.value,
        treasury: companyVal.treasury.value,
        employeeCount: parseInt(companyVal['employee-count'].value),
        totalPaid: parseInt(companyVal['total-paid'].value),
        createdAt: parseInt(companyVal['created-at'].value),
        active: companyVal.active.value,
      };
    }
    return null;
  } catch (err) {
    console.error('Error in getCompanyDetails:', err);
    return null;
  }
}

// Get employee details
export async function getEmployeeDetails(
  networkName: 'mainnet' | 'testnet' | 'devnet',
  companyId: number,
  employeeAddress: string
): Promise<Employee | null> {
  try {
    const res = await callReadOnly(networkName, 'get-employee', [
      uintCV(companyId),
      principalCV(employeeAddress),
    ]);

    if (res && res.value && res.value.value) {
      const empVal = res.value.value;
      return {
        wallet: employeeAddress,
        name: empVal.name.value,
        salary: parseInt(empVal.salary.value),
        startDate: parseInt(empVal['start-date'].value),
        active: empVal.active.value,
        totalReceived: parseInt(empVal['total-received'].value),
        lastPaidAt: parseInt(empVal['last-paid-at'].value),
      };
    }
    return null;
  } catch (err) {
    console.error('Error in getEmployeeDetails:', err);
    return null;
  }
}

// Get member role in a company
export async function getMemberRole(
  networkName: 'mainnet' | 'testnet' | 'devnet',
  companyId: number,
  memberAddress: string
): Promise<UserRole | null> {
  try {
    const res = await callReadOnly(networkName, 'get-role', [
      uintCV(companyId),
      principalCV(memberAddress),
    ]);

    if (res && res.value && res.value.value) {
      return parseInt(res.value.value) as UserRole;
    }
    return null;
  } catch (err) {
    console.error('Error in getMemberRole:', err);
    return null;
  }
}

// Get payment count for a company
export async function getPaymentCount(
  networkName: 'mainnet' | 'testnet' | 'devnet',
  companyId: number
): Promise<number> {
  try {
    const res = await callReadOnly(networkName, 'get-payment-count', [
      uintCV(companyId),
    ]);
    if (res && res.value) {
      return parseInt(res.value);
    }
    return 0;
  } catch (err) {
    console.error('Error in getPaymentCount:', err);
    return 0;
  }
}

// Get payment record by ID
export async function getPaymentRecord(
  networkName: 'mainnet' | 'testnet' | 'devnet',
  paymentId: number
): Promise<PaymentRecord | null> {
  try {
    const res = await callReadOnly(networkName, 'get-payment', [
      uintCV(paymentId),
    ]);

    if (res && res.value && res.value.value) {
      const pVal = res.value.value;
      return {
        id: paymentId,
        companyId: parseInt(pVal['company-id'].value),
        employee: pVal.employee.value,
        amount: parseInt(pVal.amount.value),
        paidAt: parseInt(pVal['paid-at'].value),
        memo: pVal.memo.value,
      };
    }
    return null;
  } catch (err) {
    console.error('Error in getPaymentRecord:', err);
    return null;
  }
}

/**
 * Public Functions (Write Transactions via Wallet Connect)
 */

interface ContractCallOptions {
  userSession: any;
  networkName: 'mainnet' | 'testnet' | 'devnet';
  network: any;
  onFinish?: (data: any) => void;
  onCancel?: () => void;
}

// Register Company
export async function registerCompanyTx(
  options: ContractCallOptions,
  name: string,
  treasury: string
) {
  const { openContractCall } = await import('@stacks/connect');
  const { address } = getContractInfo(options.networkName);
  
  return openContractCall({
    userSession: options.userSession,
    contractAddress: address,
    contractName: PAYROLL_CONTRACT_NAME,
    functionName: 'register-company',
    functionArgs: [
      stringAsciiCV(name),
      principalCV(treasury),
    ],
    network: options.network,
    onFinish: options.onFinish,
    onCancel: options.onCancel,
  });
}

// Onboard / Add Employee
export async function addEmployeeTx(
  options: ContractCallOptions,
  companyId: number,
  employeeWallet: string,
  name: string,
  salary: number
) {
  const { openContractCall } = await import('@stacks/connect');
  const { address } = getContractInfo(options.networkName);

  return openContractCall({
    userSession: options.userSession,
    contractAddress: address,
    contractName: PAYROLL_CONTRACT_NAME,
    functionName: 'add-employee',
    functionArgs: [
      uintCV(companyId),
      principalCV(employeeWallet),
      stringAsciiCV(name),
      uintCV(salary),
    ],
    network: options.network,
    onFinish: options.onFinish,
    onCancel: options.onCancel,
  });
}

// Pay single Employee using SIP-010 token (or custom)
export async function payEmployeeTx(
  options: ContractCallOptions,
  companyId: number,
  employeeWallet: string,
  amount: number,
  memo: string,
  tokenTraitAddress: string,
  tokenTraitName: string
) {
  const { openContractCall } = await import('@stacks/connect');
  const { address } = getContractInfo(options.networkName);

  return openContractCall({
    userSession: options.userSession,
    contractAddress: address,
    contractName: PAYROLL_CONTRACT_NAME,
    functionName: 'pay-employee',
    functionArgs: [
      uintCV(companyId),
      principalCV(employeeWallet),
      uintCV(amount),
      stringAsciiCV(memo),
      contractPrincipalCV(tokenTraitAddress, tokenTraitName),
    ],
    network: options.network,
    onFinish: options.onFinish,
    onCancel: options.onCancel,
  });
}

// Update Employee salary
export async function updateSalaryTx(
  options: ContractCallOptions,
  companyId: number,
  employeeWallet: string,
  newSalary: number
) {
  const { openContractCall } = await import('@stacks/connect');
  const { address } = getContractInfo(options.networkName);

  return openContractCall({
    userSession: options.userSession,
    contractAddress: address,
    contractName: PAYROLL_CONTRACT_NAME,
    functionName: 'update-salary',
    functionArgs: [
      uintCV(companyId),
      principalCV(employeeWallet),
      uintCV(newSalary),
    ],
    network: options.network,
    onFinish: options.onFinish,
    onCancel: options.onCancel,
  });
}

// Deactivate Employee
export async function deactivateEmployeeTx(
  options: ContractCallOptions,
  companyId: number,
  employeeWallet: string
) {
  const { openContractCall } = await import('@stacks/connect');
  const { address } = getContractInfo(options.networkName);

  return openContractCall({
    userSession: options.userSession,
    contractAddress: address,
    contractName: PAYROLL_CONTRACT_NAME,
    functionName: 'deactivate-employee',
    functionArgs: [
      uintCV(companyId),
      principalCV(employeeWallet),
    ],
    network: options.network,
    onFinish: options.onFinish,
    onCancel: options.onCancel,
  });
}

// Reactivate Employee
export async function reactivateEmployeeTx(
  options: ContractCallOptions,
  companyId: number,
  employeeWallet: string
) {
  const { openContractCall } = await import('@stacks/connect');
  const { address } = getContractInfo(options.networkName);

  return openContractCall({
    userSession: options.userSession,
    contractAddress: address,
    contractName: PAYROLL_CONTRACT_NAME,
    functionName: 'reactivate-employee',
    functionArgs: [
      uintCV(companyId),
      principalCV(employeeWallet),
    ],
    network: options.network,
    onFinish: options.onFinish,
    onCancel: options.onCancel,
  });
}

// Assign role
export async function assignRoleTx(
  options: ContractCallOptions,
  companyId: number,
  member: string,
  role: UserRole
) {
  const { openContractCall } = await import('@stacks/connect');
  const { address } = getContractInfo(options.networkName);

  return openContractCall({
    userSession: options.userSession,
    contractAddress: address,
    contractName: PAYROLL_CONTRACT_NAME,
    functionName: 'assign-role',
    functionArgs: [
      uintCV(companyId),
      principalCV(member),
      uintCV(role),
    ],
    network: options.network,
    onFinish: options.onFinish,
    onCancel: options.onCancel,
  });
}

// Revoke role
export async function revokeRoleTx(
  options: ContractCallOptions,
  companyId: number,
  member: string
) {
  const { openContractCall } = await import('@stacks/connect');
  const { address } = getContractInfo(options.networkName);

  return openContractCall({
    userSession: options.userSession,
    contractAddress: address,
    contractName: PAYROLL_CONTRACT_NAME,
    functionName: 'revoke-role',
    functionArgs: [
      uintCV(companyId),
      principalCV(member),
    ],
    network: options.network,
    onFinish: options.onFinish,
    onCancel: options.onCancel,
  });
}
