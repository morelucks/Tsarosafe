import {
  uintCV,
  principalCV,
  stringAsciiCV,
  contractPrincipalCV,
  hexToCV,
  serializeCV,
  cvToJSON,
} from '@stacks/transactions';
import { PAYROLL_CONTRACT_ADDRESSES, PAYROLL_CONTRACT_NAME, STACKS_NETWORKS } from './payroll-constants';

const getContractInfo = (networkName: 'mainnet' | 'testnet' | 'devnet') => {
  const address = PAYROLL_CONTRACT_ADDRESSES[networkName];
  const endpoint = STACKS_NETWORKS[networkName];
  return { address, name: PAYROLL_CONTRACT_NAME, endpoint };
};

async function callReadOnly(
  networkName: 'mainnet' | 'testnet' | 'devnet',
  functionName: string,
  args: any[]
): Promise<any> {
  const { address, name, endpoint } = getContractInfo(networkName);
  const url = `${endpoint}/v2/contracts/call-read/${address}/${name}/${functionName}`;
  const serializedArgs = args.map((arg) => Buffer.from(serializeCV(arg)).toString('hex'));
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: address, arguments: serializedArgs }),
  });
  if (!response.ok) throw new Error(`Read-only call failed`);
  const data = await response.json();
  if (data.okay && data.result) return cvToJSON(hexToCV(data.result));
  throw new Error('Read-only execution failed');
}

export async function getCompanyIdByOwner(networkName: 'mainnet' | 'testnet' | 'devnet', ownerAddress: string) {
  try {
    const res = await callReadOnly(networkName, 'get-company-by-owner', [principalCV(ownerAddress)]);
    if (res && res.value && res.value.value !== undefined) return parseInt(res.value.value);
    return null;
  } catch { return null; }
}
