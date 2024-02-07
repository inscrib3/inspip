import { Signer, Tap, Tx, TxTemplate } from "@cmdcode/tapscript";
import { addressToScriptPubKey } from "../bitcoin/helpers";
import { TxRef } from "./get-unspents";

export type PrepareTransferSatsParams = {
  amount: string;
  from: string;
  to: string;
  feerate: string;
  privateKey: Uint8Array;
  fee?: string;
  unspents: TxRef[];
  network?: "mainnet" | "testnet";
};

export const prepareTransferSats = ({
  network = "mainnet",
  ...params
}: PrepareTransferSatsParams) => {
  const privateKey = params.privateKey;
  const unspents = params.unspents;
  const amount = BigInt(params.amount);
  const feerate = BigInt(params.feerate);
  const from = params.from;
  const to = params.to;
  let fee = params.fee ? BigInt(params.fee) : 0n;

  const vin: TxTemplate["vin"] = [];
  const vout: TxTemplate["vout"] = [];

  let total = 0n;

  for (const unspent of unspents) {
    if (total >= amount + fee) {
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

    total += BigInt(unspent.value);
  }

  vout.push({
    value: amount,
    scriptPubKey: addressToScriptPubKey(to, network),
  });

  vout.push({
    value: total - amount - fee,
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

  vout[vout.length - 1].value = total - amount - fee;

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
  };
};
