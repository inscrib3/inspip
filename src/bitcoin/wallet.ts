import BIP32Factory from 'bip32';
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs';
import * as bip39 from "bip39";
import ECPairFactory, { ECPairAPI, ECPairInterface } from 'ecpair';
import { ScriptData, Signer, Tap, Tx, ValueData, Word } from '@cmdcode/tapscript';
import { addressToScriptPubKey, bigIntToString, parseStringToBigInt, textToHex, toBytes, toInt26, toXOnly } from './helpers';
import { bitcoin } from './lib/bitcoin-lib';
import { Utxo } from '../app/app-context';
import { hexToBytes } from '../utils/hex-to-bytes';
import { cleanFloat } from '../utils/clean-float';

export function generateWallet(network: any) {
    bip39.setDefaultWordlist('english');
    const mnemonic = bip39.generateMnemonic();

    return importWallet(mnemonic, network);
}

export function importWallet(mnemonic: string, network: any, index: number = 0) {
    bitcoin.initEccLib(ecc);
    const bip32 = BIP32Factory(ecc);
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const rootKey = bip32.fromSeed(seed, network);

    const data = generateNewAddress(rootKey, network, index);
    return { ...data, mnemonic, rootKey };
}

export function importWalletFromWif(wif: string, network: any, index: number = 0) {
    const ECPairInstance: ECPairAPI = ECPairFactory(ecc);
    const rootKey: ECPairInterface = ECPairInstance.fromWIF(wif, network);

    const data = generateNewAddress(rootKey, network, index);
    return { ...data, mnemonic: wif, rootKey };
}

export function generateNewAddress(rootKey: any, network: any, index: number = 0) {
    if(rootKey?.privateKey === undefined) throw new Error('Invalid private key');

    let path: string;
    if(network === bitcoin.networks.testnet) {
        path = `m/49'/1'/0'/0/${index}`;
    } else {
        path = `m/86'/0'/0'/0/${index}`;
    }
    
    let account;
    let internalPubkey;
    let address: string;
    let output;

    if (typeof rootKey.derivePath === 'function') {
        account = rootKey.derivePath(path);
        internalPubkey = toXOnly(account.publicKey);
        const payments = bitcoin.payments.p2tr({ internalPubkey: internalPubkey, network });
        address = payments.address;
        output = payments.output;
    } else {
        internalPubkey = toXOnly(rootKey.publicKey);
        bitcoin.initEccLib(ecc);
        const payments = bitcoin.payments.p2tr({ internalPubkey: internalPubkey, network });
        address = payments.address;
        output = payments.output;
    }
  
    return { rootKey, account: account ?? rootKey, internalPubkey, address, output }
}

export const sendTokens = (
    account: any,
    currentAddress: string,
    utxos: Utxo[],
    to: string,
    _ticker: string,
    _id: string,
    dec: number,
    _amount: string,
    _rate: string,
    network: any
): {
    hex: string;
    vin: any[];
    vout: any[];
    fee: string;
    ticker: string;
    id: string;
    amount: string;
    change: string;
    sats: string;
    sats_change: string;
    to: string;
} => {
    const ticker = _ticker.trim().toLowerCase();
    const id = parseInt(_id.trim());

    const amount = parseStringToBigInt(_amount, dec);
    if(amount === 0n) throw new Error('Invalid rate');

    const rate = BigInt(_rate);
    if(rate < 2n) throw new Error('Invalid rate');

    let vin = [];
    let vout: {
        value?: ValueData | undefined;
        scriptPubKey?: ScriptData | undefined;
    }[] | undefined = [];
    let found = 0n;
    let sats_found = 0n;
    const sats_amount = 1092n;

    for (let i = 0; i < utxos.length; i++) {
        if (found >= amount) {
            break;
        }

        if (utxos[i].status.confirmed) {
            try {
                if (utxos[i].tick === ticker && utxos[i].id === id) {
                    vin.push({
                        txid: utxos[i].txid,
                        vout: utxos[i].vout,
                        prevout: {
                            value: BigInt(utxos[i].value),
                            scriptPubKey: addressToScriptPubKey(currentAddress, network)
                        }
                    });
    
                    found += BigInt(utxos[i].amt || 0);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    for (let i = 0; i < utxos.length; i++) {
        if (sats_found >= sats_amount + 5_000n) {
            break;
        }

        if (
            !utxos[i].tick &&
            utxos[i].status.confirmed &&
            utxos[i].value >= 600
        ) {
            vin.push({
                txid: utxos[i].txid,
                vout: utxos[i].vout,
                prevout: {
                    value: BigInt(utxos[i].value),
                    scriptPubKey: addressToScriptPubKey(currentAddress, network)
                }
            });

            sats_found += BigInt(utxos[i].value);
        }
    }

    vout.push({
        value: 546n,
        scriptPubKey: addressToScriptPubKey(to, network)
    });

    let ec = new TextEncoder();
    let token_change = found - amount;

    let conv_amount = cleanFloat(bigIntToString(amount, dec));
    let conv_change = cleanFloat(bigIntToString(token_change, dec));

    if (token_change <= 0n) {
        vout.push({
            scriptPubKey: [ 'OP_RETURN', ec.encode('P'), ec.encode('T'),
                toBytes(toInt26(ticker)) as Word, toBytes(BigInt(id)) as Word, toBytes(0n) as Word, textToHex(conv_amount)
            ]
        })
    } else {
        vout.push({
            value: 546n,
            scriptPubKey: addressToScriptPubKey(currentAddress, network)
        });

        vout.push({
            scriptPubKey: [ 'OP_RETURN', ec.encode('P'), ec.encode('T'),
                toBytes(toInt26(ticker)) as Word, toBytes(BigInt(id)) as Word, toBytes(0n) as Word, textToHex(conv_amount),
                toBytes(toInt26(ticker)) as Word, toBytes(BigInt(id)) as Word, toBytes(1n) as Word, textToHex(conv_change)
            ]
        });
    }

    vout.push({
        value: sats_found - 5_000n,
        scriptPubKey: addressToScriptPubKey(currentAddress, network)
    })

    let txdata = Tx.create({
        vin: vin,
        vout: vout
    });

    const data = hexToBytes(Tx.encode(txdata).hex);
    const prefix = 160n;
    const txsize = prefix + BigInt(Math.floor(data.length / 4));

    const fee = rate * txsize * 2n;

    vin = [];
    vout = [];
    found = 0n;
    sats_found = 0n;

    for (let i = 0; i < utxos.length; i++) {
        if (found >= amount) {
            break;
        }

        if (utxos[i].status.confirmed) {
            try {
                if (utxos[i].tick === ticker && utxos[i].id === id) {
                    vin.push({
                        txid: utxos[i].txid,
                        vout: utxos[i].vout,
                        prevout: {
                            value: BigInt(utxos[i].value),
                            scriptPubKey: addressToScriptPubKey(currentAddress, network)
                        }
                    });
    
                    found += BigInt(utxos[i].amt || 0);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    for (let i = 0; i < utxos.length; i++) {
        if (sats_found >= sats_amount + fee) {
            break;
        }

        if (
            !utxos[i].tick &&
            utxos[i].status.confirmed &&
            utxos[i].value >= 600
        ) {
            vin.push({
                txid: utxos[i].txid,
                vout: utxos[i].vout,
                prevout: {
                    value: BigInt(utxos[i].value),
                    scriptPubKey: addressToScriptPubKey(currentAddress, network)
                }
            });

            sats_found += BigInt(utxos[i].value);
        }
    }

    vout.push({
        value: 546n,
        scriptPubKey: addressToScriptPubKey(to, network)
    });

    ec = new TextEncoder();
    token_change = found - amount;

    conv_amount = cleanFloat(bigIntToString(amount, dec));
    conv_change = cleanFloat(bigIntToString(token_change, dec));

    if (token_change <= 0n) {
        vout.push({
            scriptPubKey: [ 'OP_RETURN', ec.encode('P'), ec.encode('T'),
                toBytes(toInt26(ticker)) as Word, toBytes(BigInt(id)) as Word, toBytes(0n) as Word, textToHex(conv_amount)
            ]
        })
    } else {
        vout.push({
            value: 546n,
            scriptPubKey: addressToScriptPubKey(currentAddress, network)
        });

        vout.push({
            scriptPubKey: [ 'OP_RETURN', ec.encode('P'), ec.encode('T'),
                toBytes(toInt26(ticker)) as Word, toBytes(BigInt(id)) as Word, toBytes(0n) as Word, textToHex(conv_amount),
                toBytes(toInt26(ticker)) as Word, toBytes(BigInt(id)) as Word, toBytes(1n) as Word, textToHex(conv_change)
            ]
        });
    }

    vout.push({
        value: sats_found - fee,
        scriptPubKey: addressToScriptPubKey(currentAddress, network)
    })

    if(
        found < amount ||
        sats_found < sats_amount + fee
    ) {
        throw new Error('Insufficient token funds, or transaction still unconfirmed');
    }

    txdata = Tx.create({
        vin  : vin,
        vout : vout
    });

    const [tseckey] = Tap.getSecKey(account.account.privateKey)

    for (let i = 0; i < vin.length; i++) {
        const sig = Signer.taproot.sign(tseckey, txdata, i)
        txdata.vin[i].witness = [sig]
        Signer.taproot.verify(txdata, i, { throws: true })
    }

    return {
        hex: Tx.encode(txdata).hex,
        vin: vin.map((v) => ({
            ...v,
            prevout: {
                ...v.prevout,
                value: v.prevout.value.toString(),
            }
        })),
        vout: vout.map((v) => ({
            ...v,
            value: v.value?.toString(),
        })),
        fee: fee.toString(),
        ticker,
        id: _id,
        to: to,
        amount: conv_amount,
        change: conv_change,
        sats: sats_found.toString(),
        sats_change: (sats_found - fee).toString(),
    };
};

export const sendSats = (
    account: any,
    currentAddress: string,
    utxos: Utxo[],
    toAddress: string,
    amount: bigint,
    rate: bigint,
    network: any,
): {
    hex: string;
    vin: any[];
    vout: any[];
    fee: string;
    sats: string;
    to: string;
    sats_amount: string,
    sats_change: string;
} => {
    let vin = [];
    let vout = [];
    let found = 0n;

    if(utxos.length === 0) throw new Error("No UTXOs available")

    utxos = utxos.sort((a, b) => b.value - a.value);

    for(let i = 0; i < utxos.length; i++)
    {
        if(found >= amount + 5_000n) break;

        if(!utxos[i].tick && utxos[i].status.confirmed && utxos[i].value >= 600) {
            vin.push({
                txid: utxos[i].txid,
                vout: utxos[i].vout,
                prevout: {
                    value: BigInt(utxos[i].value),
                    scriptPubKey: addressToScriptPubKey(currentAddress, network)
                }
            });
            
            found += BigInt(utxos[i].value);
        }
    }

    vout.push({
        value: amount,
        scriptPubKey: addressToScriptPubKey(toAddress, network)
    });

    vout.push({
        value: found - amount - 5_000n,
        scriptPubKey: addressToScriptPubKey(currentAddress, network)
    })

    let txdata = Tx.create({
        vin: vin,
        vout: vout
    });

    const data = hexToBytes(Tx.encode(txdata).hex);
    const prefix = 160n;
    const txsize = prefix + BigInt(Math.floor(data.length / 4));

    const fee = rate * txsize * 2n;

    vin = [];
    vout = [];
    found = 0n;

    for(let i = 0; i < utxos.length; i++)
    {
        if(found >= amount + fee) break;

        if(!utxos[i].tick && utxos[i].status.confirmed && utxos[i].value >= 600) {
            vin.push({
                txid: utxos[i].txid,
                vout: utxos[i].vout,
                prevout: {
                    value: BigInt(utxos[i].value),
                    scriptPubKey: addressToScriptPubKey(currentAddress, network)
                }
            });
            
            found += BigInt(utxos[i].value);
        }
    }

    if(found < amount + fee) throw new Error("Insufficient token funds, or transaction still unconfirmed");

    vout.push({
        value: amount,
        scriptPubKey: addressToScriptPubKey(toAddress, network)
    });

    vout.push({
        value: found - amount - fee,
        scriptPubKey: addressToScriptPubKey(currentAddress, network)
    })

    txdata = Tx.create({
        vin: vin,
        vout: vout
    });

    const [tseckey] = Tap.getSecKey(account.account.privateKey)

    for (let i = 0; i < vin.length; i++) {
        const sig = Signer.taproot.sign(tseckey, txdata, i)
        txdata.vin[i].witness = [sig]
        Signer.taproot.verify(txdata, i, { throws: true })
    }
      
    return {
        hex: Tx.encode(txdata).hex,
        vin: vin.map((v) => ({
            ...v,
            prevout: {
                ...v.prevout,
                value: v.prevout.value.toString(),
            }
        })),
        vout: vout.map((v) => ({
            ...v,
            value: v.value?.toString(),
        })),
        fee: fee.toString(),
        sats: found.toString(),
        to: toAddress,
        sats_amount: amount.toString(),
        sats_change: (found - amount - fee).toString(),
    };
}
