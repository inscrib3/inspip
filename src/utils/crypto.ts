import * as CryptoJS from 'crypto-js';

export function encrypt(text: string, password: string): string {
  const ciphertext = CryptoJS.AES.encrypt(text, password);
  return ciphertext.toString();
}

export function decrypt(encryptedText: string, password: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, password);
  return bytes.toString(CryptoJS.enc.Utf8);
}
