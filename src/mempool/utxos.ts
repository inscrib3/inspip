export const utxos = async (network: 'testnet' | 'main' = 'main') => {
  const networkPrefix = network === 'testnet' ? 'testnet/' : '';
  const res = await fetch(`https://mempool.space/${networkPrefix}api/address/bc1pmx5dzznq2neyq28agnthyz4nxf3y822njs0h2tavm4tpvdg2m07szrnw8u/utxo`);
  const data = await res.json();
  return data;
}