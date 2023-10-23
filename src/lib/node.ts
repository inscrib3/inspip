export const getDeployment = async (ticker: string, id: number) => {
  try {
    const deployment = await fetch(
      `${import.meta.env.VITE_APP_API}/getdeployment?ticker=${ticker}&id=${id}`
    );

    if (!deployment.ok) throw new Error("Deployment not found");

    const deploymentData = await deployment.json();

    return deploymentData.data;
  } catch (e) {
    throw new Error("Deployment not found");
  }
};

export const fetchUtxo = async (txid: string, vout: number) => {
  try {
    const utxo = await fetch(
      `${import.meta.env.VITE_APP_API}/utxo/${txid}/${vout}`
    );

    if (!utxo.ok) throw new Error("Utxo not found");

    const data = await utxo.json();

    return data;
  } catch (e) {
    throw new Error("Utxo not found");
  }
};

export async function fetchUtxos(address: string) {
  const response = await fetch(
    `https://mempool.space/api/address/${address}/utxo`
  );
  let utxos: { txid: string, hex: string, value: number }[] = await response.json();

  utxos = await Promise.all(
    utxos.map(async (utxo: { txid: string; hex: string, value: number }) => {
      const hex = await fetchHex(utxo.txid);
      utxo.hex = hex;

      return utxo;
    })
  );

  utxos = utxos.sort((a, b) => {
    return b.value - a.value;
  });

  return utxos;
}

export async function fetchHex(txid: any) {
  const response = await fetch(`https://mempool.space/api/tx/${txid}/hex`);
  return await response.text();
}

export async function sendTransaction(hexstring: any) {
  try {
    const response = await fetch("https://mempool.space/api/tx", {
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
