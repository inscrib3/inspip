import { selectAllOrdinalsUnspents } from "./select-all-ordinals-unspents";
import { selectAllPipeUnspents } from "./select-all-pipe-unspents";
import { selectUnspents } from "./select-unspents";
import { prepareTransferSats } from "./prepare-transfer-sats";

export type TransferSatsParams = {
  privateKey: Uint8Array;
  from: string;
  to: string;
  amount: string;
  feerate: string;
  network?: "mainnet" | "testnet";
};

export const transferSats = async ({
  network = "mainnet",
  ...params
}: TransferSatsParams) => {
  const privateKey = params.privateKey;
  const from = params.from;
  const to = params.to;
  const amount = BigInt(params.amount);
  const feerate = BigInt(params.feerate);

  const pipeUnspents = await selectAllPipeUnspents({
    network,
    address: from,
  });

  const ordinalsUnspents = await selectAllOrdinalsUnspents({
    network,
    address: from,
  });

  const exclude = [
    ...pipeUnspents,
    ...ordinalsUnspents.map((ordinals) => {
      const output = ordinals.output.split(":");
      return {
        txId: output[0],
        vout: parseInt(output[1]),
      };
    })
  ];

  let selectUnspentsRes;
  let prepareTransferSatsRes;
  let total = amount;
  let fee = 0n;

  do {
    selectUnspentsRes = await selectUnspents({
      network,
      address: from,
      amount: total.toString(),
      exclude,
    });

    if (BigInt(selectUnspentsRes.total) < total) {
      throw new Error("Not enough funds");
    }

    prepareTransferSatsRes = prepareTransferSats({
      privateKey,
      network,
      from,
      to,
      fee: fee.toString(),
      amount: amount.toString(),
      feerate: feerate.toString(),
      unspents: selectUnspentsRes.unspents,
    });

    fee = BigInt(prepareTransferSatsRes.fee);
    total = amount + fee;
  } while (BigInt(prepareTransferSatsRes.change) < 0n);

  return {
    hex: prepareTransferSatsRes.hex,
    vin: prepareTransferSatsRes.vin.map((v) => ({
        ...v,
        prevout: {
            ...v.prevout,
            value: v.prevout?.value.toString(),
        }
    })),
    vout: prepareTransferSatsRes.vout.map((v) => ({
        ...v,
        value: v.value?.toString(),
    })),
    fee: prepareTransferSatsRes.fee,
    sats: selectUnspentsRes.total,
    to,
    sats_amount: amount.toString(),
    sats_change: prepareTransferSatsRes.change.toString(),
  };
};
