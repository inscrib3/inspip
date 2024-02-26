import { Signer, Tap, Tx, TxTemplate, Word } from "@cmdcode/tapscript";
import { addressToScriptPubKey, bigIntToString, textToHex, toBytes, toInt26 } from "../bitcoin/helpers";
import { TxRef } from "./get-unspents";
import { PipeUnspent } from "./get-pipe-unspents";
import { constants } from "../constants/constants";
import { cleanFloat } from "../utils/clean-float";

export type PrepareTransferPipeParams = {
  ticker: string;
  id: string;
  amount: string;
  decimals: string;
  from: string;
  to: string;
  feerate: string;
  privateKey: Uint8Array;
  fee?: string;
  unspents: TxRef[];
  pipeUnspents: PipeUnspent[];
  network?: "mainnet" | "testnet";
};

export const prepareTransferPipe = ({
  network = "mainnet",
  ...params
}: PrepareTransferPipeParams) => {
  const ticker = params.ticker;
  const id = params.id;
  const decimals = params.decimals;
  const privateKey = params.privateKey;
  const unspents = params.unspents;
  const amount = BigInt(params.amount);
  const feerate = BigInt(params.feerate);
  const from = params.from;
  const to = params.to;
  let fee = params.fee ? BigInt(params.fee) : 0n;
  const pipeUnspents = params.pipeUnspents;

  const vin: TxTemplate["vin"] = [];
  const vout: TxTemplate["vout"] = [];

  let pipeAmount = 0n;

  for (const pipeUnspent of pipeUnspents) {
    vin.push({
      txid: pipeUnspent.txId,
      vout: pipeUnspent.vout,
      prevout: {
          value: BigInt(constants.utxo_dummy_value),
          scriptPubKey: addressToScriptPubKey(from, network)
      }
    });

    pipeAmount += BigInt(pipeUnspent.amount);
  }

  const inputAmount = vin.map(v => v.prevout?.value as bigint).reduce((a, b) => a + b, 0n);
  let total = 0n;

  for (const unspent of unspents) {
    if (total >= inputAmount + fee) {
      break;
    }

    vin.push({
      txid: unspent.tx_hash,
      vout: unspent.tx_output_n,
      prevout: {
        value: BigInt(unspent.value),
        scriptPubKey: addressToScriptPubKey(from, network),
      },
    });
    
    const currSpentsStr = localStorage.getItem("currSpents");
    const currSpents = JSON.parse(currSpentsStr || "[]");
    currSpents.push({txid: unspent.tx_hash,vout: unspent.tx_output_n});
    localStorage.setItem("currSpents", JSON.stringify(currSpents));

    total += BigInt(unspent.value);
  }

  vout.push({
    value: BigInt(constants.utxo_dummy_value),
    scriptPubKey: addressToScriptPubKey(to, network),
  });

  const ec = new TextEncoder();
  const token_change = pipeAmount - amount;

  const conv_amount = cleanFloat(bigIntToString(amount, Number(decimals)));
  const conv_change = cleanFloat(bigIntToString(token_change, Number(decimals)));

  if (token_change <= 0n) {
      vout.push({
          scriptPubKey: [ 'OP_RETURN', ec.encode('P'), ec.encode('T'),
              toBytes(toInt26(ticker)) as Word, toBytes(BigInt(id)) as Word, toBytes(0n) as Word, textToHex(conv_amount)
          ]
      })
  } else {
      vout.push({
          value: constants.utxo_dummy_value,
          scriptPubKey: addressToScriptPubKey(from, network)
      });

      vout.push({
          scriptPubKey: [ 'OP_RETURN', ec.encode('P'), ec.encode('T'),
              toBytes(toInt26(ticker)) as Word, toBytes(BigInt(id)) as Word, toBytes(0n) as Word, textToHex(conv_amount),
              toBytes(toInt26(ticker)) as Word, toBytes(BigInt(id)) as Word, toBytes(1n) as Word, textToHex(conv_change)
          ]
      });
  }

  vout.push({
    value: total - inputAmount - fee,
    scriptPubKey: addressToScriptPubKey(from, network),
  });

  const [tseckey] = Tap.getSecKey(privateKey);

  const testTx = Tx.create({
    vin: vin,
    vout: vout,
  });

  for (let i = 0; i < vin.length; i++) {
    const sig = Signer.taproot.sign(tseckey, testTx, i);
    testTx.vin[i].witness = [sig];
    Signer.taproot.verify(testTx, i, { throws: true });
  }

  const txSize = Tx.util.getTxSize(testTx);
  const vsize = BigInt(txSize.vsize);

  fee = vsize * feerate;

  vout[vout.length - 1].value = total - inputAmount - fee;

  const tx = Tx.create({
    vin: vin,
    vout: vout,
  });

  for (let i = 0; i < vin.length; i++) {
    const sig = Signer.taproot.sign(tseckey, tx, i);
    tx.vin[i].witness = [sig];
    Signer.taproot.verify(tx, i, { throws: true });
  }

  return {
    tx,
    hex: Tx.encode(tx).hex,
    vin,
    vout,
    vsize: vsize.toString(),
    fee: fee.toString(),
    change: vout[vout.length - 1].value?.toString() || "0",
    pipeChange: conv_change,
    pipeAmount: conv_amount,
  };
};
