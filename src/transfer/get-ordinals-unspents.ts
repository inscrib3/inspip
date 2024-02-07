import { constants } from "../constants/constants";
import { GetUnspentsParams } from "./get-unspents";

export type OrdinalsUnspent = {
  id: string;
  number: number;
  address: string;
  genesis_address: string;
  genesis_block_height: number;
  genesis_block_hash: string;
  genesis_tx_id: string;
  genesis_fee: string;
  genesis_timestamp: number;
  tx_id: string;
  location: string;
  output: string;
  value: string;
  offset: string;
  sat_ordinal: string;
  sat_rarity: string;
  sat_coinbase_height: number;
  mime_type: string;
  content_type: string;
  content_length: number;
  timestamp: number;
  curse_type: string | null;
  recursive: boolean;
  recursion_refs: string | null;
};

export const getOrdinalsUnspents = async ({
  network = "mainnet",
  cursor = null,
  ...params
}: GetUnspentsParams) => {
  const url = `${
    network === "mainnet"
      ? constants.ordinals_indexer.main
      : constants.ordinals_indexer.testnet
  }${constants.ordinals_indexer.api.unspents
    .replace(":limit", "60")
    .replace(":address", params.address)
    .replace(":offset", cursor ? cursor : "0")
  }`;

  const res: { results: OrdinalsUnspent[] } = await (await fetch(url)).json();

  return res.results || [];
};
