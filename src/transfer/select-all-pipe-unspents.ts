import { PipeUnspent, getPipeUnspents } from "./get-pipe-unspents";
import { SelectAllUnspentsParams } from "./select-all-unspents";

export const selectAllPipeUnspents = async ({
  network = "mainnet",
  ...params
}: SelectAllUnspentsParams) => {
  const unspents: PipeUnspent[] = [];

  let cursor = 1;
  let hasMore = true;
  let sleep = 1000;

  do {
    try {
      const nextUnspents = await getPipeUnspents({ address: params.address, cursor: cursor.toString(), network });

      if (nextUnspents.length === 0) {
        hasMore = false;
        break;
      }

      unspents.push(...nextUnspents);

      cursor += 1;
      sleep = 1000;
    } catch (e) {
      console.error(e);
      sleep *= 2;
      await new Promise(resolve => setTimeout(resolve, sleep));
    }
  } while (hasMore);

  return unspents;
};
