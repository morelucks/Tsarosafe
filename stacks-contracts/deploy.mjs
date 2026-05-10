import txPkg from '@stacks/transactions';
const { makeContractDeploy, broadcastTransaction, AnchorMode } = txPkg;
import netPkg from '@stacks/network';
const { STACKS_MAINNET } = netPkg;
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const network = STACKS_MAINNET;

async function run() {
  const privateKey = process.env.privateKey?.replace(/['"]/g, '').trim();
  if (!privateKey) {
    console.error('privateKey not found in .env');
    return;
  }

  const codeBody = fs.readFileSync('./contracts/tsaro-token.clar', 'utf8');

  const txOptions = {
    contractName: 'tsaro-token',
    codeBody,
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  try {
    const transaction = await makeContractDeploy(txOptions);
    console.log('Transaction built, broadcasting...');
    const result = await broadcastTransaction({ transaction, network });
    console.log('Broadcast result:', JSON.stringify(result, null, 2));
    if (result.error) {
      console.error('Transaction REJECTED:', result.reason);
    } else {
      console.log('Contract deployment broadcasted!');
      console.log('Transaction ID:', result.txid);
    }
  } catch (error) {
    console.error('Deployment failed:', error);
  }
}

run();
