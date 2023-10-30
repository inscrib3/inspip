import { decrypt, encrypt } from '../utils/crypto';

export function editWallet(currentAddress: string = '', addresses: number[] = [], addressIndex: number | undefined = undefined) {
  const data = localStorage.getItem('wallet');
  if (!data) throw new Error('Wallet not found');

  const parsedData = JSON.parse(data);
  if (!parsedData?.mnemonic) throw new Error('Wallet corrupted');

  if (currentAddress !== '') parsedData.currentAddress = currentAddress;
  if (addresses.length > 0) parsedData.addresses = addresses;

  if (addressIndex !== undefined && parsedData.addressIndex !== addressIndex) {
    parsedData.addressIndex = addressIndex;
  }

  localStorage.setItem('wallet', JSON.stringify(parsedData));

  return parsedData;
}

export function saveWallet(mnemonic: string, network: string, currentAddress: string, addresses: number[], password: string) {
  const wallet = {
      mnemonic: encrypt(mnemonic, password),
      network,
      currentAddress,
      addresses,
  }
  localStorage.setItem('wallet', JSON.stringify(wallet));
}

export function loadWallet(password: string) {
  const data = localStorage.getItem('wallet');
  if (!data) throw new Error('Wallet not found');

  const parsedData = JSON.parse(data);
  if (!parsedData?.mnemonic) throw new Error('Wallet corrupted');

  try {
      parsedData.mnemonic = decrypt(parsedData.mnemonic, password);
  } catch (e) {
      throw new Error('Wrong password');
  }
  
  return parsedData;
}
