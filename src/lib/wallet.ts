import { bitcoin } from './bitcoin-lib';
import BIP32Factory from 'bip32';
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs';
import { Buffer } from 'buffer';
import * as bip39 from "bip39";
import { ScriptData, Signer, Tap, Tx, ValueData, Word } from '@cmdcode/tapscript';
import { addressToScriptPubKey, cleanFloat, formatNumberString, resolveNumberString, textToHex, toBytes, toInt26, toXOnly } from './utils';
import { fetchUtxo, getDeployment } from './node';

interface Utxo {
    txid: string;
    vout: number;
    value: number;
    confirmations: number;
    spendable: boolean;
    solvable: boolean;
    safe: boolean;
    address: string;
    hex: string;
    status: any;
}

interface UtxoDb {
    key: string;
    tick?: string;
    id?: number;
    amt?: BigInt;
}

console.log('bitcoin', bitcoin.networks);

const network = bitcoin.networks.testnet;
const path = (network === bitcoin.networks.bitcoin) ? `m/86'/0'/0'` : `m/49'/1'/0'/0`;

export function generateWallet() {
    bip39.setDefaultWordlist('english');
    const mnemonic = bip39.generateMnemonic();

    return importWallet(mnemonic);
}

export function importWallet(mnemonic: string) {
    bitcoin.initEccLib(ecc);
    const bip32 = BIP32Factory(ecc);

    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const rootKey = bip32.fromSeed(seed, network)
  
    const account: any = rootKey.derivePath(path)
    const internalPubkey: any = toXOnly(account.publicKey)
    const { address, output } = bitcoin.payments.p2tr({ internalPubkey: internalPubkey, network })
  
    return { network, rootKey, mnemonic, account, internalPubkey, address, output }
}

export const newSendTokens = async (account: any, utxos: Utxo[], to: string, _ticker: string, _id: string, _amount: string, _rate: string) => {
    const ticker = _ticker.trim().toLowerCase();
    const id = parseInt(_id.trim());

    const deployment = await getDeployment(ticker, id);

    if (deployment === null) {
        throw new Error('Deployment not found');
    }

    const amount = BigInt(resolveNumberString(_amount, deployment.dec));
    const rate = BigInt(_rate);

    let vin = [];
    let found = 0n;
    let sats_found = 0n;
    let sats_amount = 1092n;

    for (let i = 0; i < utxos.length; i++) {
        if (found >= amount) {
            break;
        }

        if (utxos[i].status.confirmed) {
            const utxo = 'utxo_' + utxos[i].txid + '_' + utxos[i].vout;

            try {
                const _utxo = await fetchUtxo(utxo);

                if (_utxo.tick === ticker && _utxo.id === id) {
                    vin.push({
                        txid: utxos[i].txid,
                        vout: utxos[i].vout,
                        prevout: {
                            value: BigInt(utxos[i].value),
                            scriptPubKey: addressToScriptPubKey(account.address, network)
                        }
                    });
    
                    found += BigInt(_utxo.amt);
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    for (let i = 0; i < utxos.length; i++) {
        if (sats_found >= sats_amount * rate) {
            break;
        }

        let token_utxo_exists = false;

        try {
            const utxo = 'utxo_' + utxos[i].txid + '_' + utxos[i].vout;
            await fetchUtxo(utxo);
            token_utxo_exists = true;
        } catch(e){
            console.log(e);
        }

        if (
            !token_utxo_exists &&
            utxos[i].status.confirmed
        ) {
            vin.push({
                txid: utxos[i].txid,
                vout: utxos[i].vout,
                prevout: {
                    value: BigInt(utxos[i].value),
                    scriptPubKey: await addressToScriptPubKey(account.address, network)
                }
            });

            sats_found += BigInt(utxos[i].value);
        }
    }

    if(found < amount) {
        throw new Error('Insufficient token funds');
    }

    let vout: {
        value?: ValueData | undefined;
        scriptPubKey?: ScriptData | undefined;
    }[] | undefined = [];

    vout.push({
        value: 546n,
        scriptPubKey: await addressToScriptPubKey(to, network)
    });

    const ec = new TextEncoder();
    let conv_amount = cleanFloat(formatNumberString(amount.toString(), deployment.dec));
    const token_change = found - amount;

    if (token_change <= 0n) {
        vout.push({
            scriptPubKey: [ 'OP_RETURN', ec.encode('P'), ec.encode('T'),
                toBytes(toInt26(ticker)) as Word, toBytes(BigInt(id)) as Word, toBytes(0n) as Word, textToHex(conv_amount)
            ]
        })
    } else {
        let conv_change = cleanFloat(formatNumberString(token_change.toString(), deployment.dec));

        vout.push({
            value: 546n,
            scriptPubKey: await addressToScriptPubKey(account.address, network)
        });

        vout.push({
            scriptPubKey: [ 'OP_RETURN', ec.encode('P'), ec.encode('T'),
                toBytes(toInt26(ticker)) as Word, toBytes(BigInt(id)) as Word, toBytes(0n) as Word, textToHex(conv_amount),
                toBytes(toInt26(ticker)) as Word, toBytes(BigInt(id)) as Word, toBytes(1n) as Word, textToHex(conv_change)
            ]
        });
    }

    vout.push({
        value: found - amount - 143n * rate, // @todo check 143n default
        scriptPubKey: addressToScriptPubKey(account.address, network)
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

export function sendSats(account: any, utxos: Utxo[], rate: bigint, fromAddress: string, toAddress: string, amount: bigint): string {
    let vin = [];
    let found = 0n;

    if(utxos.length === 0) throw new Error("No UTXOs available")
    utxos = utxos.sort((a, b) => b.value - a.value);
    for(let i = 0; i < utxos.length; i++)
    {
        if(found >= amount * rate * 2n) break;
        console.log(utxos[i]);

        if(utxos[i].status.confirmed) {
            vin.push({
                txid: utxos[i].txid,
                vout: utxos[i].vout,
                prevout: {
                    value: BigInt(utxos[i].value),
                    scriptPubKey: addressToScriptPubKey(fromAddress, network)
                }
            });
            
            found += BigInt(utxos[i].value);
        }
    }

    if(found < amount * rate * 2n) throw new Error("Insufficient funds")

    let vout = [];
    vout.push({
        value: amount,
        scriptPubKey: addressToScriptPubKey(toAddress, network)
    });
    vout.push({
        value: found - amount - 143n * rate, // @todo check 143n default
        scriptPubKey: addressToScriptPubKey(fromAddress, network)
    })

    const txdata = Tx.create({
        vin: vin,
        vout: vout
    });

    const [tseckey] = Tap.getSecKey(account.privateKey)

    for (let i = 0; i < vin.length; i++) {
        const sig = Signer.taproot.sign(tseckey, txdata, i)
        txdata.vin[i].witness = [sig]
        Signer.taproot.verify(txdata, i, { throws: true })
    }
      
    return Tx.encode(txdata).hex;
}

export function sendTokens(privKey: string, fromAddress: string, toAddress: string, rate: bigint, utxos: Utxo[], utxos_db: UtxoDb[], amount: bigint, ticker: string, id: number, token_decimals: number): string {
    const keyPair = bitcoin.ECPair.fromWIF(privKey, network);
    const psbt = new bitcoin.Psbt({ network });

    const { vin, found } = selectUtxos(fromAddress, rate, utxos, utxos_db, amount, ticker, id)

    let vout = [];
    vout.push({
        value: 546n,
        scriptPubKey: addressToScriptPubKey(toAddress, network)
    });

    const ec = new TextEncoder();
    // amount *= 10n ** BigInt(token_decimals);
    const conv_amount = cleanFloat(formatNumberString(amount.toString(), token_decimals));
    const token_change = found - amount;
    if(token_change <= 0n)
    {
        vout.push({
            scriptPubKey: [ 'OP_RETURN', ec.encode('P'), ec.encode('T'),
                toBytes(toInt26(ticker)), toBytes(BigInt(id)), toBytes(0n), textToHex(conv_amount)
            ]
        });
    } else {
        let conv_change = cleanFloat(formatNumberString(token_change.toString(), token_decimals));

        vout.push({
            value: 546n,
            scriptPubKey: addressToScriptPubKey(fromAddress, network)
        });

        vout.push({
            scriptPubKey: [ 'OP_RETURN', ec.encode('P'), ec.encode('T'),
                toBytes(toInt26(ticker)), toBytes(BigInt(id)), toBytes(0n), textToHex(conv_amount),
                toBytes(toInt26(ticker)), toBytes(BigInt(id)), toBytes(1n), textToHex(conv_change)
            ]
        });
    }

    // Add inputs to the PSBT
    for (const input of vin) {
        psbt.addInput({
            hash: input.txid,
            index: input.vout,
            nonWitnessUtxo: Buffer.from(input.prevout.value.toString(16), 'hex')
        });
    }

    // Add outputs to the PSBT
    for (const output of vout) {
        if(output?.value !== undefined)
            psbt.addOutput({
                value: parseInt(output.value.toString()),
                script: bitcoin.script.fromASM(output.scriptPubKey.join(' '))
            });
        else
            throw new Error('Output value is undefined');
    }

    // Sign all inputs in the PSBT
    for (let i = 0; i < vin.length; i++) {
        psbt.signInput(i, keyPair);
    }

    psbt.validateSignaturesOfAllInputs();
    psbt.finalizeAllInputs();

    return psbt.extractTransaction().toHex();
}

export function selectUtxos(fromAddress: string, rate: bigint, utxos: Utxo[], utxos_db: any[], amount: bigint, ticker: string, id: number) {
    const vin = [];
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
        if (sats_found >= sats_amount * rate) {
            break;
        }

        const utxoKey = 'utxo_' + utxos[i].txid + '_' + utxos[i].vout;
        let _utxo = utxos_db.find(utxo => utxo.key === utxoKey);
        let token_utxo_exists = _utxo === undefined ? false : true;
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
        throw new Error('Insufficient token funds');
    }

    return { vin, found };
}
