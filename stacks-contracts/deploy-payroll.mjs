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

  console.log('Reading contract code...');
  const codeBody = fs.readFileSync('./contracts/tsaro-payroll.clar', 'utf8');

  const txOptions = {
    contractName: 'tsaro-payroll',
    codeBody,
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 250000, // 0.25 STX in microstacks
  };

  try {
    console.log('Building transaction with 0.25 STX fee...');
    const transaction = await makeContractDeploy(txOptions);
    console.log('Transaction built, broadcasting...');
    const result = await broadcastTransaction({ transaction, network });
    
    console.log('Broadcast result:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.error('Transaction REJECTED:', result.reason || result.error);
    } else {
      console.log('-------------------------------------------');
      console.log('✅ Contract deployment broadcasted!');
      console.log('Transaction ID:', `0x${result.txid || result}`);
      console.log('Explorer link:', `https://explorer.hiro.so/txid/0x${result.txid || result}?chain=mainnet`);
      console.log('-------------------------------------------');
    }
  } catch (error) {
    console.error('Deployment failed:', error);
  }
}

run();
