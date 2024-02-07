import { OrdinalsUnspent, getOrdinalsUnspents } from "./get-ordinals-unspents";
import { SelectAllUnspentsParams } from "./select-all-unspents";

export const selectAllOrdinalsUnspents = async ({
  network = "mainnet",
  ...params
}: SelectAllUnspentsParams) => {
  const unspents: OrdinalsUnspent[] = [];

  let cursor = 0;
  let hasMore = true;
  let sleep = 1000;

  do {
    try {
      const nextUnspents = await getOrdinalsUnspents({ address: params.address, cursor: cursor.toString(), network });

      if (nextUnspents.length === 0) {
        hasMore = false;
        break;
      }

      unspents.push(...nextUnspents);

      cursor += 60;
      sleep = 1000;
    } catch (e) {
      console.error(e);
      sleep *= 2;
      await new Promise(resolve => setTimeout(resolve, sleep));
    }
  } while (hasMore);

  return unspents;
};
