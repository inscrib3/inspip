import { bitcoin } from './bitcoin-lib';
import { Address, Script, Signer, Tap, Tx } from '@cmdcode/tapscript';

export const toXOnly = (pubKey: Buffer) => (pubKey.length === 32 ? pubKey : pubKey.slice(1, 33));

export function isValidNumber(strNum: string)
{
    let validNumber = new RegExp(/^\d*\.?\d*$/);
    return validNumber.test(''+strNum);
}

export function isSegwitAddress(to: string)
{
    if(to.startsWith('tb1q') || to.startsWith('bc1q'))
    {
        return true;
    }
    else if(to.startsWith('tb1p') || to.startsWith('bc1p'))
    {
        return true;
    }

    return false;
}

export function addressToScriptPubKey(to: string, network: string) {
    let _toAddress, _script;

    if (to.startsWith('tb1q') || to.startsWith('bc1q')) {
        _toAddress = bitcoin.address.fromBech32(to);
        _script = bitcoin.payments.p2wpkh({ address: to, network: network }).output;
    } else if (to.startsWith('1') || to.startsWith('m') || to.startsWith('n')) {
        _toAddress = bitcoin.address.fromBase58Check(to);
        _script = bitcoin.payments.p2pkh({ address: to, network: network }).output;
    } else if (to.startsWith('3') || to.startsWith('2')) {
        _toAddress = bitcoin.address.fromBase58Check(to);
        _script = bitcoin.payments.p2sh({ address: to, network: network }).output;
    } else {
        _toAddress = Address.p2tr.decode(to).hex;
        _script = [ 'OP_1', _toAddress ];
    }

    return _script;
}

export function resolveNumberString(number: string, decimals: number) {
    if (!isValidNumber(number)) {
        throw new Error('Invalid op number');
    }

    let [integerPart, decimalPart = ''] = number.split(".");
    
    // Adjust the decimal part to the desired length
    while (decimalPart.length < decimals) {
        decimalPart += "0";
    }
    decimalPart = decimalPart.substring(0, decimals);

    // Combine the integer and decimal parts
    number = integerPart + decimalPart;

    // Remove leading zeros
    number = number.replace(/^0+/, '');

    return number || '0';
}

export function cleanFloat(input: string) {
    // Remove commas
    input = input.replace(/,/g, '');

    // Parse the input as a float to handle leading and trailing zeros
    const floatNumber = parseFloat(input);

    // Return the parsed float as a string or throw an error if it's NaN
    if (!isNaN(floatNumber)) {
        return String(floatNumber);
    } else {
        throw new Error('Invalid float to clean');
    }
}

export function formatNumberString(str: string, decimals: number) {

    let pos = str.length - decimals;

    if(decimals == 0) {
        // nothing
    }else
    if(pos > 0){
        str = str.substring(0, pos) + "." + str.substring(pos, str.length);
    }else{
        str = '0.' + ( "0".repeat( decimals - str.length ) ) + str;
    }

    return str;
}

function charRange(start: string, stop: string) {
    var result = [];

    // get all chars from starting char
    // to ending char
    var i = start.charCodeAt(0),
        last = stop.charCodeAt(0) + 1;
    for (i; i < last; i++) {
        result.push(String.fromCharCode(i));
    }

    return result;
}

function countDecimals(value: string){
    const num = value.split('.');
    return num[1] ? num[1].length : 0;
}

export function toInt26(str: string) {
    var alpha = charRange('a', 'z');
    var result = 0n;

    // make sure we have a usable string
    str = str.toLowerCase();
    str = str.replace(/[^a-z]/g, '');

    // we're incrementing j and decrementing i
    var j = 0n;
    for (var i = str.length - 1; i > -1; i--) {
        // get letters in reverse
        var char = str[i];

        // get index in alpha and compensate for
        // 0 based array
        var position = BigInt(''+alpha.indexOf(char));
        position++;

        // the power kinda like the 10's or 100's
        // etc... position of the letter
        // when j is 0 it's 1s
        // when j is 1 it's 10s
        // etc...
        const pow = (base: bigint, exponent: bigint) => base ** exponent;

        var power = pow(26n, j)

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

function fromBytes(buffer: any) {
    const bytes = new Uint8Array(buffer);
    const size = bytes.byteLength;
    let x = 0n;
    for (let i = 0; i < size; i++) {
        const byte = BigInt(bytes[i]);
        x = (x << 8n) | byte;
    }
    return x;
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
    var encoder = new TextEncoder().encode(text);
    return [...new Uint8Array(encoder)]
        .map(x => x.toString(16).padStart(2, "0"))
        .join("");
}
