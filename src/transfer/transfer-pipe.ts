import { selectAllOrdinalsUnspents } from "./select-all-ordinals-unspents";
import { selectAllPipeUnspents } from "./select-all-pipe-unspents";
import { selectUnspents } from "./select-unspents";
import { prepareTransferPipe } from "./prepare-transfer-pipe";
import { PipeUnspent } from "./get-pipe-unspents";
import { constants } from "../constants/constants";

export type TransferPipeParams = {
  privateKey: Uint8Array;
  from: string;
  to: string;
  amount: string; // in btc
  ticker: string;
  id: string;
  decimals: string;
  feerate: string;
  network?: "mainnet" | "testnet";
};

export const transferPipe = async (params: TransferPipeParams) => {
  const privateKey = params.privateKey;
  const from = params.from;
  const to = params.to;
  const amount = BigInt(params.amount);
  const ticker = params.ticker.toLowerCase();
  const id = params.id;
  const decimals = params.decimals;
  const feerate = params.feerate;
  const network = params.network || "mainnet";

  const pipeUnspents = await selectAllPipeUnspents({
    network,
    address: from,
  });

  let selectedPipeSatsAmount = 0n;
  let selectedPipeAmount = 0n;

  const selectedPipeUnspents: PipeUnspent[] = [];

  const currSpentsStr = localStorage.getItem("currSpents");
  const currSpents = JSON.parse(currSpentsStr || "[]");

  for (const pipeUnspent of pipeUnspents) {
    if (selectedPipeAmount >= amount) {
      break;
    }

    if (pipeUnspent.ticker.toLowerCase() !== ticker || pipeUnspent.id.toString() !== id) {
      continue;
    }

    if(currSpents.length > 0){
      const match = currSpents.find((el: { txId: string; vout: number; })=>(el.txId === pipeUnspent.txId && el.vout === pipeUnspent.vout));
      if(match) continue;
    }

    selectedPipeUnspents.push(pipeUnspent);
    selectedPipeAmount += BigInt(pipeUnspent.amount);
    selectedPipeSatsAmount += BigInt(constants.utxo_dummy_value);
  }

  if (selectedPipeAmount < amount) {
    throw new Error("Not enough funds");
  }

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
    }),
  ];

  let selectUnspentsRes;
  let prepareTransferPipeRes;
  let total = selectedPipeSatsAmount;
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

    prepareTransferPipeRes = prepareTransferPipe({
      privateKey,
      network,
      from,
      to,
      ticker,
      id,
      decimals: decimals.toString(),
      fee: fee.toString(),
      amount: amount.toString(),
      feerate: feerate.toString(),
      unspents: selectUnspentsRes.unspents,
      pipeUnspents: selectedPipeUnspents,
    });

    fee = BigInt(prepareTransferPipeRes.fee);
    total = selectedPipeSatsAmount + fee;
  } while (BigInt(prepareTransferPipeRes.change) < 0n);

  return {
    hex: prepareTransferPipeRes.hex,
    vin: prepareTransferPipeRes.vin.map((v) => ({
        ...v,
        prevout: {
            ...v.prevout,
            value: v.prevout?.value.toString(),
        }
    })),
    vout: prepareTransferPipeRes.vout.map((v) => ({
        ...v,
        value: v.value?.toString(),
    })),
    fee: prepareTransferPipeRes.fee,
    ticker,
    id,
    amount: prepareTransferPipeRes.pipeAmount,
    to,
    sats: total.toString(),
    sats_amount: total.toString(),
    change: prepareTransferPipeRes.pipeChange.toString(),
    sats_change: prepareTransferPipeRes.change.toString(),
  };
};
