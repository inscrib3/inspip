export const getDeployment = async (ticker: string, id: number) => {
  try {
    const deployment = await fetch(
      `${import.meta.env.VITE_SERVER_HOST || "https://indexer.inspip.com"}/getdeployment?ticker=${ticker}&id=${id}`
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
      `${import.meta.env.VITE_SERVER_HOST || "https://indexer.inspip.com"}/utxo/${txid}/${vout}`
    );

    if (!utxo.ok) throw new Error("Utxo not found");

    const data = await utxo.json();

    return data;
  } catch (e) {
    throw new Error("Utxo not found");
  }
};
