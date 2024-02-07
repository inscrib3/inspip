import { TxRef, getUnspents } from "./get-unspents";

export type SelectAllUnspentsParams = {
  address: string;
  network?: "mainnet" | "testnet";
}

export const selectAllUnspents = async ({
  network = "mainnet",
  ...params
}: SelectAllUnspentsParams) => {
  const unspents: TxRef[] = [];

  let cursor = null;
  let hasMore = true;
  let sleep = 1000;

  do {
    try {
      const nextUnspents = await getUnspents({ address: params.address, cursor: cursor?.toString(), network });

      if (!nextUnspents.txrefs || nextUnspents.txrefs.length === 0) {
        hasMore = false;
        break;
      }

      unspents.push(...nextUnspents.txrefs);

      cursor = nextUnspents.txrefs[nextUnspents.txrefs.length - 1].block_height;
      sleep = 1000;
    } catch (e) {
      console.error(e);
      sleep *= 2;
      await new Promise(resolve => setTimeout(resolve, sleep));
    }
  } while (hasMore);

  return unspents;
};
