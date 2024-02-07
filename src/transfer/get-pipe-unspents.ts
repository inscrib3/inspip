import { constants } from "../constants/constants";
import { GetUnspentsParams } from "./get-unspents";

export type PipeUnspent = {
  address: string;
  txId: string;
  vout: number;
  amount: string;
  decimals: number;
  ticker: string;
  id: number;
  block: number;
  createdAt: string;
};

export const getPipeUnspents = async ({
  network = "mainnet",
  cursor = null,
  ...params
}: GetUnspentsParams) => {
  const url = `${
    network === "mainnet"
      ? constants.pipe_indexer.main
      : constants.pipe_indexer.testnet
  }${constants.pipe_indexer.api.unspents
    .replace(":limit", "50")
    .replace(":address", params.address)
    .replace(":page", cursor ? cursor : "")
  }`;

  const res: PipeUnspent[] = await (await fetch(url)).json();

  return res;
};
