import { bitcoin } from './bitcoin-lib';
import BIP32Factory from 'bip32';
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs';
import * as bip39 from "bip39";
import { ScriptData, Signer, Tap, Tx, ValueData, Word } from '@cmdcode/tapscript';
import { addressToScriptPubKey, cleanFloat, formatNumberString, resolveNumberString, textToHex, toBytes, toInt26, toXOnly } from './utils';
import { fetchUtxo, getDeployment } from './node';
import { decrypt, encrypt } from './crypto';

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

export function editWallet(currentAddress: string = '', addresses: number[] = []) {
    const data = localStorage.getItem('wallet');
    if (!data) throw new Error('Wallet not found');

    const parsedData = JSON.parse(data);
    if (!parsedData?.mnemonic) throw new Error('Wallet corrupted');

    if (currentAddress !== '') parsedData.currentAddress = currentAddress;
    if (addresses.length > 0) parsedData.addresses = addresses;

    localStorage.setItem('wallet', JSON.stringify(parsedData));

    return parsedData;
}

export function saveWallet(mnemonic: string, network: any, currentAddress: string, addresses: number[], password: string) {
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

    parsedData.mnemonic = decrypt(parsedData.mnemonic, password);
    
    return parsedData;
}

export function generateWallet(network: any) {
    bip39.setDefaultWordlist('english');
    const mnemonic = bip39.generateMnemonic();

    return importWallet(mnemonic, network);
}

export function importWallet(mnemonic: string, network: any) {
    bitcoin.initEccLib(ecc);
    const bip32 = BIP32Factory(ecc);
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const rootKey = bip32.fromSeed(seed, network);

    const data = generateNewAddress(rootKey, network);
  
    return { ...data, mnemonic, rootKey };
}

export function generateNewAddress(rootKey: any, network: any, index: number = 0) {
    const path = (network === bitcoin.networks.bitcoin) ? `m/86'/0'/0'/0/${index}` : `m/49'/1'/0'/0/${index}`;
    const account: any = rootKey.derivePath(path)
    const internalPubkey: any = toXOnly(account.publicKey)
    const { address, output } = bitcoin.payments.p2tr({ internalPubkey: internalPubkey, network })
  
    return { rootKey, account, internalPubkey, address, output }
}

export const sendTokens = async (account: any, utxos: Utxo[], to: string, _ticker: string, _id: string, _amount: string, _rate: string, network: any) => {
    const ticker = _ticker.trim().toLowerCase();
    const id = parseInt(_id.trim());

    const deployment = await getDeployment(ticker, id);

    if (deployment === null) {
        throw new Error('Deployment not found');
    }

    const amount = BigInt(resolveNumberString(_amount, deployment.dec));
    const rate = BigInt(_rate);

    const vin = [];
    let found = 0n;
    let sats_found = 0n;
    const sats_amount = 1092n;

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
                console.error(e);
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
            console.error(e);
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
                    scriptPubKey: addressToScriptPubKey(account.address, network)
                }
            });

            sats_found += BigInt(utxos[i].value);
        }
    }

    if(found < amount) {
        throw new Error('Insufficient token funds');
    }

    const vout: {
        value?: ValueData | undefined;
        scriptPubKey?: ScriptData | undefined;
    }[] | undefined = [];

    vout.push({
        value: 546n,
        scriptPubKey: await addressToScriptPubKey(to, network)
    });

    const ec = new TextEncoder();
    const conv_amount = cleanFloat(formatNumberString(amount.toString(), deployment.dec));
    const token_change = found - amount;

    if (token_change <= 0n) {
        vout.push({
            scriptPubKey: [ 'OP_RETURN', ec.encode('P'), ec.encode('T'),
                toBytes(toInt26(ticker)) as Word, toBytes(BigInt(id)) as Word, toBytes(0n) as Word, textToHex(conv_amount)
            ]
        })
    } else {
        const conv_change = cleanFloat(formatNumberString(token_change.toString(), deployment.dec));

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
        value: sats_found - 143n * rate, // @todo check 143n default
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

export function sendSats(account: any, utxos: Utxo[], toAddress: string, amount: bigint, rate: bigint, network: any): string {
    const vin = [];
    let found = 0n;

    if(utxos.length === 0) throw new Error("No UTXOs available")
    utxos = utxos.sort((a, b) => b.value - a.value);
    for(let i = 0; i < utxos.length; i++)
    {
        if(found >= amount * rate * 2n) break;

        if(utxos[i].status.confirmed) {
            vin.push({
                txid: utxos[i].txid,
                vout: utxos[i].vout,
                prevout: {
                    value: BigInt(utxos[i].value),
                    scriptPubKey: addressToScriptPubKey(account.address, network)
                }
            });
            
            found += BigInt(utxos[i].value);
        }
    }

    if(found < amount * rate * 2n) throw new Error("Insufficient funds")

    const vout = [];
    vout.push({
        value: amount,
        scriptPubKey: addressToScriptPubKey(toAddress, network)
    });
    vout.push({
        value: found - amount - 143n * rate, // @todo check 143n default
        scriptPubKey: addressToScriptPubKey(account.address, network)
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
        throw new Error('Insufficient token funds');
    }

    return { vin, found };
}
