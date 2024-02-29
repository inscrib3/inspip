import { Buffer } from 'buffer';
import { bitcoin } from './lib/bitcoin-lib';
import { Address } from '@cmdcode/tapscript';
import { cleanFloat } from '../utils/clean-float';

export const toXOnly = (pubKey: Buffer) => (pubKey.length === 32 ? pubKey : pubKey.slice(1, 33));

export function getNetwork(network: string) {
    if(network === '' || network === 'mainnet') return bitcoin.networks.bitcoin;
    else if(network === 'testnet') return bitcoin.networks.testnet;
    else throw new Error('Invalid network');
}

export function stringFromBigInt(_amount: string, mantissaDecimalPoints: number) {
  const amount = cleanFloat(_amount);
  if (/[^0-9.]/.test(amount)) {
    throw new Error("Invalid character in amount");
  }

  const [, decimalPart = ''] = amount.split('.');
  const decimalPartLength = decimalPart.length;
  if (decimalPartLength > mantissaDecimalPoints) {
      throw new Error(`Amount exceeds ${mantissaDecimalPoints} decimals`);
  }
  const amountBigInt = BigInt(amount.replace('.', ''));
  const mantissa = BigInt(10**mantissaDecimalPoints);
  const decimals = BigInt(10**decimalPartLength);
  const result = amountBigInt *  mantissa / decimals;

  return result;
}

export function parseStringToBigInt(amount: string, mantissaDecimalPoints: number) {
    if (/[^0-9.]/.test(amount)) {
      throw new Error("Invalid character in amount");
    }

    const [, decimalPart = ''] = amount.split('.');
    const decimalPartLength = decimalPart.length;
    if (decimalPartLength > mantissaDecimalPoints) {
        throw new Error(`Amount exceeds ${mantissaDecimalPoints} decimal`);
    }
    const amountBigInt = BigInt(amount.replace('.', ''));
    const mantissa = BigInt(10**mantissaDecimalPoints);
    const decimals = BigInt(10**decimalPartLength);
    const result = amountBigInt *  mantissa / decimals;
  
    return result;
}

export function bigIntToString(valueBigInt: bigint, decimalPlaces: number) {
    const factor = BigInt(10 ** decimalPlaces);
    const wholePart = valueBigInt / factor;
    const decimalPart = valueBigInt % factor;
    const paddedDecimalPart = decimalPart.toString().padStart(decimalPlaces, '0');

    return `${wholePart}.${paddedDecimalPart}`;
}

export function addressToScriptPubKey(address: string, _network: "mainnet" | "testnet") {
    let _toAddress, _script;
    
    const network = _network === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

    if (address.startsWith('tb1q') || address.startsWith('bc1q')) {
        _toAddress = bitcoin.address.fromBech32(address);
        _script = bitcoin.payments.p2wpkh({ address, network }).output;
    } else if (address.startsWith('1') || address.startsWith('m') || address.startsWith('n')) {
        _toAddress = bitcoin.address.fromBase58Check(address);
        _script = bitcoin.payments.p2pkh({ address, network }).output;
    } else if (address.startsWith('3') || address.startsWith('2')) {
        _toAddress = bitcoin.address.fromBase58Check(address);
        _script = bitcoin.payments.p2sh({ address, network }).output;
    } else {
        _toAddress = Address.p2tr.decode(address).hex;
        _script = [ 'OP_1', _toAddress ];
    }

    return _script;
}

export function validateAddress(address: string, network: any): boolean {
    try {
        return bitcoin.address.toOutputScript(address, network);
    } catch(e) {
        return false;
    }
}

function charRange(start: string, stop: string) {
    const result: any = [];

    // get all chars from starting char
    // to ending char
    let i = start.charCodeAt(0);
    const last = stop.charCodeAt(0) + 1;
    for (i; i < last; i++) {
        result.push(String.fromCharCode(i));
    }

    return result;
}

export function toInt26(str: string) {
    const alpha = charRange('a', 'z');
    let result = 0n;

    // make sure we have a usable string
    str = str.toLowerCase();
    str = str.replace(/[^a-z]/g, '');

    // we're incrementing j and decrementing i
    let j = 0n;
    for (let i = str.length - 1; i > -1; i--) {
        // get letters in reverse
        const char = str[i];

        // get index in alpha and compensate for
        // 0 based array
        let position = BigInt(''+alpha.indexOf(char));
        position++;

        // the power kinda like the 10's or 100's
        // etc... position of the letter
        // when j is 0 it's 1s
        // when j is 1 it's 10s
        // etc...
        const pow = (base: bigint, exponent: bigint) => base ** exponent;

        const power = pow(26n, j)

        // add the power and index to result
        result += power * position;
        j++;
    }

    return result;
}

function bitLength(number: bigint) {
    if (typeof number !== 'bigint') {
        throw new Error("Input must be a BigInt");
    }
    return number === 0n ? 0 : number.toString(2).length;
}

function byteLength(number: bigint) {
    if (typeof number !== 'bigint') {
        throw new Error("Input must be a BigInt");
    }
    return Math.ceil(bitLength(number) / 8);
}

export function toBytes(number: bigint) {
    if (typeof number !== 'bigint') {
        throw new Error("Input must be a BigInt");
    }

    if (number < 0n) {
        throw new Error("BigInt must be non-negative");
    }

    if (number === 0n) {
        return new Uint8Array().buffer;
    }

    const size = byteLength(number);
    const bytes = new Uint8Array(size);
    let x = number;
    for (let i = size - 1; i >= 0; i--) {
        bytes[i] = Number(x & 0xFFn);
        x >>= 8n;
    }

    return bytes.buffer;
}

export function textToHex(text: string) {
    const encoder = new TextEncoder().encode(text);
    return [...new Uint8Array(encoder)]
        .map(x => x.toString(16).padStart(2, "0"))
        .join("");
}
