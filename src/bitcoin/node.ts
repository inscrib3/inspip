import { Utxo } from "./lib/bitcoin-lib";

export async function fetchUtxos(address: string, network: string): Promise<Utxo[]> {
  if(address.length === 0) throw new Error('Invalid address provided');

  const response = await fetch(
    `https://mempool.space/${network === 'testnet' ? 'testnet/' : ''}api/address/${address}/utxo`
  );
  let utxos: Utxo[] = await response.json();

  utxos = await Promise.all(
    utxos.map(async (utxo) => {
      const hex = await fetchHex(utxo.txid, network);
      utxo.hex = hex;

      return utxo;
    })
  );

  utxos = utxos.sort((a, b) => {
    return b.value - a.value;
  });

  return utxos;
}

export async function fetchHex(txid: any, network: string) {
  const response = await fetch(`https://mempool.space/${network === 'testnet' ? 'testnet/' : ''}api/tx/${txid}/hex`);
  return await response.text();
}

export async function sendTransaction(hexstring: any, network: string) {
  try {
    const response = await fetch(`https://mempool.space/${network === 'testnet' ? 'testnet/' : ''}api/tx`, {
      method: "POST",
      body: hexstring,
    });
    if (!response.ok) {
      const error = await response.text();
      const _error = new Error(error);
      throw new Error(`Something went wrong: '${_error.message}'`);
    }
    const result = await response.text();
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export type FeesResponse = {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
};

export const getFees = async () => {
  const response = await fetch("https://mempool.space/api/v1/fees/recommended");
  const data: FeesResponse = await response.json();
  return {
    ...data,
    economyFee: data.economyFee <= 2 ? 3 : data.economyFee,
    halfHourFee: data.halfHourFee <= 2 ? 3 : data.halfHourFee,
  };
};
