import { TxRef, getUnspents } from "./get-unspents";
import { constants } from "../constants/constants";

export type SelectUnspentsParams = {
  address: string;
  amount: string;
  network?: "mainnet" | "testnet";
  exclude?: {
    txId: string;
    vout: number;
  }[];
};

export const selectUnspents = async ({
  network = "mainnet",
  ...params
}: SelectUnspentsParams) => {
  const amount = BigInt(params.amount);
  const unspents: TxRef[] = [];

  let total = 0n;
  let cursor = null;
  let sleep = 1000;
  // TODO Merge 'params.exclude' with 'currSpents' and exclude
  const currSpentsStr = localStorage.getItem("currSpents");
  const currSpents = JSON.parse(currSpentsStr || "[]");
  let exclude = params?.exclude || [];
  exclude = [...exclude,...currSpents];

  do {
    try {
      const nextUnspents = await getUnspents({
        address: params.address,
        cursor,
        network,
      });

      if (!nextUnspents.txrefs || nextUnspents.txrefs.length === 0) {
        break;
      }

      for (const utxo of nextUnspents.txrefs) {
        if (
          exclude?.some(
            (exclud) =>
              exclud.txId === utxo.tx_hash && exclud.vout === utxo.tx_output_n
          )
        ) {
          continue;
        }

        if (
          utxo.spent ||
          utxo.double_spend ||
          utxo.value <= constants.utxo_dummy_value
        ) {
          continue;
        }

        unspents.push(utxo);
        total += BigInt(utxo.value);

        if (total >= amount) {
          break;
        }
      }

      cursor =
        nextUnspents.txrefs[
          nextUnspents.txrefs.length - 1
        ].block_height.toString();
      sleep = 1000;
    } catch (e) {
      console.error(e);
      sleep *= 2;
      await new Promise((resolve) => setTimeout(resolve, sleep));
    }
  } while (total < amount);

  return {
    unspents,
    total: total.toString(),
  };
};
