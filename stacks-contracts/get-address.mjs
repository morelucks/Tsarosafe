import txPkg from '@stacks/transactions';
const { getAddressFromPrivateKey, TransactionVersion } = txPkg;
import dotenv from 'dotenv';
dotenv.config();

const pk = process.env.privateKey?.replace(/['"]/g, '').trim();
if (pk) {
  const address = getAddressFromPrivateKey(pk, TransactionVersion.Mainnet);
  console.log(address);
} else {
  console.error('No private key found');
}
