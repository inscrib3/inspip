import mempoolJS from '@mempool/mempool.js';

const { bitcoin: mempoolBitcoin } = mempoolJS({
  hostname: 'mempool.space',
  network: 'mainnet', // @todo support testnet
});

export async function getFeesRecommended() {
  return await mempoolBitcoin.fees.getFeesRecommended();
}

export async function getUtxosByAddress(address: string) {
  return await mempoolBitcoin.addresses.getAddressTxsUtxo({ address });
}

export async function getTxStatus(txid: string) {
  return await mempoolBitcoin.transactions.getTxStatus({ txid });
}

export async function getHexByTxId(txid: string) {
  return await mempoolBitcoin.transactions.getTxHex({ txid });
}

export async function getMempoolTxIds() {
  return await mempoolBitcoin.mempool.getMempoolTxids();
}

export async function getFees(feeRateTier: string) {
  const res = await mempoolBitcoin.fees.getFeesRecommended();
  switch (feeRateTier) {
    case 'fastestFee':
      return res.fastestFee;
    case 'halfHourFee':
      return res.halfHourFee;
    case 'hourFee':
      return res.hourFee;
    default:
      return res.minimumFee;
  }
}
