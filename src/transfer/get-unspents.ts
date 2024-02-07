import { constants } from "../constants/constants";

export type TxRef = {
  tx_hash: string;
  block_height: number;
  tx_input_n: number;
  tx_output_n: number;
  value: number;
  ref_balance: number;
  spent: boolean;
  confirmations: number;
  confirmed: string;
  double_spend: boolean;
};

export type GetUnspentsResponse = {
  address: string;
  total_received: number;
  total_sent: number;
  balance: number;
  unconfirmed_balance: number;
  final_balance: number;
  n_tx: number;
  unconfirmed_n_tx: number;
  final_n_tx: number;
  txrefs?: TxRef[];
  tx_url: string;
};

export type GetUnspentsParams = {
  address: string;
  cursor?: string | null;
  network?: "mainnet" | "testnet";
};

export const getUnspents = async ({
  network = "mainnet",
  cursor = null,
  ...params
}: GetUnspentsParams) => {
  const url = `${
    network === "mainnet" ? constants.bitcoin_indexer.main : constants.bitcoin_indexer.testnet
  }${constants.bitcoin_indexer.api.unspents
    .replace(":address", params.address)
    .replace(":before", cursor ? cursor : "")
  }`;

  const res: GetUnspentsResponse = await (await fetch(url)).json();

  return res;
};
