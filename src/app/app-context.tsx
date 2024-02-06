import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { editWallet, updateStoredWallet } from '../bitcoin/wallet-storage';

export type Utxo = {
  txid: string,
  hex?: string,
  status: {
    confirmed: boolean,
  },
  vout: number,
  value: number,
  tick?: string,
  id?: number,
  dec?: number,
  amt?: string,
};

export const AppContext = createContext<{
  network: string,
  setNetwork: (network: string) => void,
  account: any,
  setAccount: (account: any) => void,
  currentAddress: string,
  setCurrentAddress: (address: string, index: number) => void,
  addresses: number[],
  setAddresses: (addresses: number[]) => void,
  loading: boolean,
  feerate: number,
  setFeerate: (feerate: number) => void,
  tokens: { tick: string, id: number, dec: number }[],
  setTokens: (tokens: { tick: string, id: number, dec: number }[]) => void,
  utxos: Utxo[],
  fetchUtxos: () => Promise<Utxo[]>,
}>({
  account: {},
  loading: false,
  setAccount: () => undefined,
  network: 'mainnet',
  setNetwork: () => undefined,
  currentAddress: '',
  setCurrentAddress: () => undefined,
  addresses: [],
  setAddresses: () => undefined,
  feerate: 0,
  setFeerate: () => undefined,
  tokens: [],
  setTokens: () => undefined,
  utxos: [],
  fetchUtxos: async () => [],
});

export type Tx = {
  txid: string;
  vin: {
    txid: string;
    vout: number;
  }[];
  vout: {
    index: number;
    scriptpubkey_address: string;
    value: number;
  }[];
  status?: {
    confirmed: boolean;
  }
};

export type TxsStorage = {
  last_txid: string;
  data: {
    [txid: string]: Tx;
  };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getUtxos = async (address: string) => {
  const savedUtxos = localStorage.getItem(`txs_${address}`);

  let txs: TxsStorage = {
    last_txid: "",
    data: {},
  };

  if (savedUtxos !== null) {
    txs = JSON.parse(savedUtxos);
  }

  let numOfRes = 0;

  do {
    let nextTxs: Tx[];

    try {
      const res = await fetch(
        `https://mempool.space/api/address/${address}/txs/chain/${txs.last_txid}`
      );
      nextTxs = (await res.json()) as Tx[];
      await sleep(2000);
    } catch (e) {
      await sleep(2000);
      const res = await fetch(
        `https://mempool.space/api/address/${address}/txs/chain/${txs.last_txid}`
      );
      nextTxs = (await res.json()) as Tx[];
    }

    const data = nextTxs.filter((tx) => !txs.data[tx.txid]);

    if (data.length === 0) {
      txs.last_txid = '';
      localStorage.setItem(`txs_${address}`, JSON.stringify(txs));
      break;
    }

    for (const tx of data) {
      txs.data[tx.txid] = {
        txid: tx.txid,
        vin: tx.vin.map((input) => ({
          txid: input.txid,
          vout: input.vout,
        })),
        vout: [],
      };

      for (const [voutIndex, vout] of tx.vout.entries()) {
        if (vout.scriptpubkey_address !== address) continue;

        txs.data[tx.txid].vout.push({
          index: voutIndex,
          scriptpubkey_address: vout.scriptpubkey_address,
          value: vout.value,
        });
      }
    }

    txs.last_txid = data[data.length - 1].txid;

    if (data.length < 25) {
      txs.last_txid = '';
    }

    localStorage.setItem(`txs_${address}`, JSON.stringify(txs));

    numOfRes = data.length;
  } while (numOfRes === 25);

  const utxos: {
    [txid: string]: {
      [vout: number]: {
        scriptpubkey_address: string;
        value: number;
      };
    }
  } = {};

  for (const tx of Object.values(txs.data)) {
    for (const vout of tx.vout) {
      if (!utxos[tx.txid]) {
        utxos[tx.txid] = {};
      }

      utxos[tx.txid][vout.index] = vout;
    }
  }

  for (const tx of Object.values(txs.data)) {
    for (const vin of tx.vin) {
      if (utxos[vin.txid]) {
        delete utxos[vin.txid][vin.vout];

        if (Object.keys(utxos[vin.txid]).length === 0) {
          delete utxos[vin.txid];
        }
      }
    }
  }

  let unconfirmed: Tx[] = [];

  try {
    const data = await fetch(`https://mempool.space/api/address/${address}/txs/mempool`);
    unconfirmed = (await data.json()) as Tx[];
  } catch (error) {
    await sleep(4000);
    const data = await fetch(`https://mempool.space/api/address/${address}/txs/mempool`);
    unconfirmed = (await data.json()) as Tx[];
  }


  for (const tx of unconfirmed) {
    if (tx.status?.confirmed) continue;

    for (const vin of tx.vin) {
      if (utxos[vin.txid]) {
        delete utxos[vin.txid][vin.vout];

        if (Object.keys(utxos[vin.txid]).length === 0) {
          delete utxos[vin.txid];
        }
      }
    }
  }

  localStorage.setItem(`txs_${address}`, JSON.stringify(txs));

  const finalUtxos: {
    txid: string
    vout: number
    value: number;
    status: {
      confirmed: true,
    }
  }[] = [];

  for (const tx in utxos) {
    for (const vout in utxos[tx]) {
      finalUtxos.push({
        txid: tx,
        vout: parseInt(vout),
        value: utxos[tx][vout].value,
        status: {
          confirmed: true,
        },
      });
    }
  }

  return finalUtxos;
};

export interface IndexerToken {
  beneficiaryAddress: string;
  block: number;
  bvo: number;
  collectionAddress: string;
  collectionNumber: number;
  createdAt: string;
  decimals: number;
  id: number;
  limit: number;
  maxSupply: number;
  pid: number;
  amount?: number;
  remaining: number;
  ticker: string;
  txId: string;
  updatedAt: string;
  vo: number;
  vout: number;
  metadata?: string;
  mime?: string;
  ref?: string;
  traits?: string[];
}

export interface AppProviderProps {
  children: React.ReactNode;
}

// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBC77tDyyuddrsc_Jdm0BcsKNoFl5BXWOQ",
  authDomain: "inspip-wallet.firebaseapp.com",
  projectId: "inspip-wallet",
  storageBucket: "inspip-wallet.appspot.com",
  messagingSenderId: "734952055419",
  appId: "1:734952055419:web:a5cdb017c0d7423c99f8de",
  measurementId: "G-523R85SP1N"
};

export const AppProvider = (props: AppProviderProps) => {
  const [account, setAccount] = useState({});
  const [network, _setNetwork] = useState<string>('mainnet');
  const [addresses, _setAddresses] = useState<number[]>([]);
  const [currentAddress, _setCurrentAddress] = useState<string>('');
  const [feerate, setFeerate] = useState(0);
  const [tokens, setTokens] = useState<{ tick: string, id: number, dec: number }[]>([]);

  const [utxos, setUtxos] = useState<Utxo[]>([]);
  const loading = useRef(false);
  const [firebase, setFirebase] = useState<FirebaseApp | null>(null);
  const [, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (firebase) return;
    const nextFirebase = initializeApp(firebaseConfig);
    setAnalytics(getAnalytics(nextFirebase));
    setFirebase(nextFirebase);
  }, [firebase]);

  const fetchUtxos = useCallback(async (): Promise<Utxo[]> => {
    if (loading.current || currentAddress === '') return [];

    loading.current = true;

    try {
      let satsUtxo: Utxo[];

      try {
        const utxoRes = await fetch(`https://mempool.space/${network === 'testnet' ? 'testnet/' : ''}api/address/${currentAddress}/utxo`);

        if (!utxoRes.ok) {
          satsUtxo = await getUtxos(currentAddress);
        } else {
          satsUtxo = await utxoRes.json();
        }
      } catch (e) {
        satsUtxo = await getUtxos(currentAddress);
      }

      if (satsUtxo.length === 0) {
        setUtxos([]);
        loading.current = false;
        return [];
      }

      satsUtxo = satsUtxo.sort((a, b) => b.value - a.value);

      const utxoChunks: string[][] = [];

      for (let i = 0; i < satsUtxo.length; i += 25) {
        utxoChunks.push(satsUtxo.slice(i, i + 25).map((utxo) => `${utxo.txid}_${utxo.vout}`));
      }

      const utxoChunksRes = await Promise.all(utxoChunks.map((chunk) => fetch(`${
        import.meta.env.VITE_SERVER_HOST
      }/utxo/search?params=${chunk.join(',')}`)));

      const utxoChunksData = await Promise.all(utxoChunksRes.map((res) => res.json()));

      const tokensUtxos = utxoChunksData.flat();

      const uniqueTickers: {
        tick: string,
        id: number,
        dec: number,
      }[] = [];

      tokensUtxos.forEach((utxo) => {
        if (uniqueTickers.find((ticker) => ticker.tick === utxo.ticker && ticker.id === utxo.id)) return;
        uniqueTickers.push({
          tick: utxo.ticker,
          id: utxo.id,
          dec: utxo.decimals,
        });
      });

      setTokens(uniqueTickers);

      const nextUtxos: Utxo[] =  satsUtxo.map((utxo) => {
        const tokenUtxo = tokensUtxos.find((tokenUtxo) => {
          return tokenUtxo.txId === utxo.txid && tokenUtxo.vout === utxo.vout;
        });

        return {
          ...utxo,
          tick: tokenUtxo?.ticker,
          id: tokenUtxo?.id,
          amt: tokenUtxo?.amount?.toString(),
          dec: tokenUtxo?.decimals,
        };
      });

      setUtxos(nextUtxos);
      loading.current = false;
      return nextUtxos;
    } catch (e) {
      console.error(e);
      setUtxos([]);
      loading.current = false;
      return []; 
    }
  }, [currentAddress, network]);

  useEffect(() => {
    fetchUtxos();
  }, [fetchUtxos]);

  const setAddresses = (addresses: number[]) => {
    _setAddresses(addresses);
    editWallet('', addresses);
  };

  const setCurrentAddress = (address: string, index: number) => {
    _setCurrentAddress(address);
    editWallet(address, [], index);
  };

  const setNetwork = (network: string) => {
    _setNetwork(network);
    updateStoredWallet('network', network);
  };

  return (
    <AppContext.Provider
      value={{
        account,
        setAccount,
        network,
        setNetwork,
        currentAddress,
        setCurrentAddress,
        addresses,
        setAddresses,
        feerate,
        loading: loading.current,
        setFeerate,
        tokens,
        setTokens,
        utxos,
        fetchUtxos,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
