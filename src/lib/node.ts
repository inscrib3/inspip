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

    if (!utxo.ok) throw new Error("Deployment not found");

    const data = await utxo.json();

    return data;
  } catch (e) {
    throw new Error("Deployment not found");
  }
};

export async function fetchUtxos(address: string) {
  const response = await fetch(
    `https://mempool.space/api/address/${address}/utxo`
  );
  let utxos = await response.json();

  utxos = await Promise.all(
    utxos.map(async (utxo: { txid: any; hex: string }) => {
      const hex = await fetchHex(utxo.txid);
      utxo.hex = hex;

      return utxo;
    })
  );

  return utxos;
}

export async function fetchHex(txid: any) {
  const response = await fetch(`https://mempool.space/api/tx/${txid}/hex`);
  return await response.text();
}

export async function sendTransaction(hexstring: any, maxfeerate: any) {
  const url =
    "https://methodical-multi-gadget.btc-testnet.quiknode.pro/c8dfdddbdf9678b10dd05a623bfbe42c3f7808b2";
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const body = JSON.stringify({
    method: "sendrawtransaction",
    params: [hexstring, maxfeerate],
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: headers,
    body: body,
    redirect: "follow",
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
