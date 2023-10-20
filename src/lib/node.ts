export const getDeployment = async (ticker: string, id: number) => {
    return {
        ticker,
        id,
        dec: 8,
    }
};

export const fetchUtxo = async (utxo: string) => {
    if (
        utxo === 'utxo_2c9e6a3fb933059518cfe423108fe1856aab7fb56de8c43de3a46d94cf90af56_0' ||
        utxo === 'utxo_95d30f8a1209fef2d065797193e5f3a6490155a443883df92f6cb3f1afbe61fc_0'
    ) {
        return {
            tick: "x",
            id: 0,
            amt: 100000000000,
        }
    }

    throw new Error("UTXO not found");
};

export async function fetchUtxos(address: string) {
    const response = await fetch(`https://mempool.space/api/address/${address}/utxo`);
    let utxos = await response.json()

    utxos = await Promise.all(utxos.map(async (utxo: { txid: any; hex: string; }) => {
        const hex = await fetchHex(utxo.txid);
        utxo.hex = hex;

        return utxo;
    }));

    return utxos;
}

export async function fetchHex(txid: any) {
    const response = await fetch(`https://mempool.space/api/tx/${txid}/hex`);
    return await response.text()
}

export async function sendTransaction(hexstring: any, maxfeerate: any) {
    const url = "https://methodical-multi-gadget.btc-testnet.quiknode.pro/c8dfdddbdf9678b10dd05a623bfbe42c3f7808b2";
    const headers = new Headers({
        "Content-Type": "application/json"
    });
    
    const body = JSON.stringify({
        "method": "sendrawtransaction",
        "params": [hexstring, maxfeerate]
    });
    
    const requestOptions: RequestInit = {
        method: 'POST',
        headers: headers,
        body: body,
        redirect: 'follow'
    };
    
    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.text();
        console.log(result);
    } catch (error) {
        console.log('Error:', error);
    }
}
