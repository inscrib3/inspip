import { bitcoin } from './lib/bitcoin-lib';
import BIP32Factory from 'bip32';
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs';
import * as bip39 from "bip39";
import { ScriptData, Signer, Tap, Tx, ValueData, Word } from '@cmdcode/tapscript';
import { addressToScriptPubKey, bigIntToString, parseStringToBigInt, textToHex, toBytes, toInt26, toXOnly } from './helpers';
import { Utxo } from '../app/app-context';

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

    /*{
    const network = bitcoin.networks.bitcoin;
    const wif = ""
    const ECPair: ECPairAPI = ECPairFactory(ecc);
    console.log("ECPair", ECPair)
    const keyPair: ECPairInterface = ECPair.fromWIF(wif, network);
    console.log("keyPair", keyPair);
    const privateKey = keyPair.privateKey?.toString('hex');
    const hdMaster = bip32.fromSeed(Buffer.from(privateKey, 'hex'), network);
    const chainCode = hdMaster.chainCode.toString('hex');
    console.log('chainCode', chainCode);
    }*/

    const data = generateNewAddress(rootKey, network, index);
    return { ...data, mnemonic, rootKey };
}

export function generateNewAddress(rootKey: any, network: any, index: number = 0) {
    let path: string;
    if(network === bitcoin.networks.testnet) {
        path = `m/49'/1'/0'/0/${index}`;
    } else {
        path = `m/86'/0'/0'/0/${index}`;
    }
    const account: any = rootKey.derivePath(path);
    const internalPubkey: any = toXOnly(account.publicKey);
    const { address, output } = bitcoin.payments.p2tr({ internalPubkey: internalPubkey, network });
  
    return { rootKey, account, internalPubkey, address, output }
}

export const sendTokens = async (account: any, currentAddress: string, utxos: Utxo[], to: string, _ticker: string, _id: string, dec: number, _amount: string, _rate: string, network: any) => {
    const ticker = _ticker.trim().toLowerCase();
    const id = parseInt(_id.trim());

    const amount = parseStringToBigInt(_amount, dec);
    if(amount === 0n) throw new Error('Invalid rate');

    const rate = BigInt(_rate);
    if(rate < 2n) throw new Error('Invalid rate');

    const vin: any = [];
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
        if (sats_found >= sats_amount + (163n * rate * 2n)) {
            break;
        }

        if (
            !utxos[i].tick &&
            utxos[i].status.confirmed
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

    if(
        found < amount ||
        sats_found < sats_amount + (163n * rate * 2n)
    ) {
        throw new Error('Insufficient token funds, or transaction still unconfirmed');
    }

    const vout: {
        value?: ValueData | undefined;
        scriptPubKey?: ScriptData | undefined;
    }[] | undefined = [];

    vout.push({
        value: 546n,
        scriptPubKey: addressToScriptPubKey(to, network)
    });

    const ec = new TextEncoder();
    const token_change = found - amount;

    const conv_amount = bigIntToString(amount, dec);
    const conv_change = bigIntToString(token_change, dec);

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
        value: sats_found - (163n * rate * 2n), // @todo check 163n default
        scriptPubKey: addressToScriptPubKey(currentAddress, network)
    })

    const txdata = Tx.create({
        vin  : vin,
        vout : vout
    });

    const [tseckey] = Tap.getSecKey(account.account.privateKey)

    for (let i = 0; i < vin.length; i++) {
        const sig = Signer.taproot.sign(tseckey, txdata, i)
        txdata.vin[i].witness = [sig]
        Signer.taproot.verify(txdata, i, { throws: true })
    }

    return Tx.encode(txdata).hex;
};

export const sendSats = async (account: any, currentAddress: string, utxos: Utxo[], toAddress: string, amount: bigint, rate: bigint, network: any): Promise<string> => {
    const vin: any = [];
    let found = 0n;

    if(utxos.length === 0) throw new Error("No UTXOs available")
    utxos = utxos.sort((a, b) => b.value - a.value);
    for(let i = 0; i < utxos.length; i++)
    {
        if(found >= amount + (163n * rate * 2n)) break;

        if(!utxos[i].tick && utxos[i].status.confirmed) {
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

    if(found < amount + (163n * rate * 2n)) throw new Error("Insufficient token funds, or transaction still unconfirmed")

    const vout: any = [];
    vout.push({
        value: amount,
        scriptPubKey: addressToScriptPubKey(toAddress, network)
    });
    vout.push({
        value: found - amount - (163n * rate * 2n), // @todo check 163n default
        scriptPubKey: addressToScriptPubKey(currentAddress, network)
    })

    const txdata = Tx.create({
        vin: vin,
        vout: vout
    });

    const [tseckey] = Tap.getSecKey(account.account.privateKey)

    for (let i = 0; i < vin.length; i++) {
        const sig = Signer.taproot.sign(tseckey, txdata, i)
        txdata.vin[i].witness = [sig]
        Signer.taproot.verify(txdata, i, { throws: true })
    }
      
    return Tx.encode(txdata).hex;
}

export function selectUtxos(fromAddress: string, rate: bigint, utxos: Utxo[], utxos_db: any[], amount: bigint, ticker: string, id: number, network: any) {
    const vin: any = [];
    let found = 0n;
    let sats_found = 0n;
    const sats_amount = 1092n;

    // UTXO selection for tokens
    for (let i = 0; i < utxos.length; i++) {
        if (found >= amount) {
            break;
        }

        if(utxos[i].status.confirmed) {
            const utxoKey = 'utxo_' + utxos[i].txid + '_' + utxos[i].vout;

            const _utxo = utxos_db.find((utxo) => utxo.key === utxoKey);
            if(_utxo !== undefined) {
                const get_utxo = JSON.parse(_utxo);

                if (get_utxo.tick === ticker && get_utxo.id === id) {
                    vin.push({
                        txid: utxos[i].txid,
                        vout: utxos[i].vout,
                        prevout: {
                            value: BigInt(utxos[i].value),
                            scriptPubKey: addressToScriptPubKey(fromAddress, network) 
                        }
                    });

                    found += BigInt(get_utxo.amt);
                }
            }
        }
    }

    // UTXO selection for satoshis
    for (let i = 0; i < utxos.length; i++) {
        if (sats_found >= sats_amount + (rate * 2n)) {
            break;
        }

        const utxoKey = 'utxo_' + utxos[i].txid + '_' + utxos[i].vout;
        const _utxo = utxos_db.find(utxo => utxo.key === utxoKey);
        const token_utxo_exists = _utxo === undefined ? false : true;
        if (
            !token_utxo_exists &&
            utxos[i].status.confirmed
        ) {
            vin.push({
                txid: utxos[i].txid,
                vout: utxos[i].vout,
                prevout: {
                    value: BigInt(utxos[i].value),
                    scriptPubKey: addressToScriptPubKey(fromAddress, network)
                }
            });

            sats_found += BigInt(utxos[i].value);
        }
    }

    if (found < amount) {
        throw new Error('Insufficient token funds, or transaction still unconfirmed');
    }

    return { vin, found };
}
