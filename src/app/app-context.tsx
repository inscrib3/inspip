import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { editWallet, updateStoredWallet } from '../bitcoin/wallet-storage';

export type Utxo = {
  protocol?: "pipe" | "ordinals";
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
  fetchUtxos: () => Promise<any>,
  signPsbt: any,
  setSignPsbt: any,
  signMessage: any,
  setSignMessage: any,
  verifySign: any,
  setVerifySign: any
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
  fetchUtxos: async () => [],
  signPsbt: {},
  setSignPsbt: () => undefined,
  signMessage: {},
  setSignMessage: () => undefined,
  verifySign: {},
  setVerifySign: () => undefined,
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
import { selectAllOrdinalsUnspents } from '../transfer/select-all-ordinals-unspents';
import { selectAllPipeUnspents } from '../transfer/select-all-pipe-unspents';
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

  const [signPsbt, setSignPsbt] = useState({});
  const [signMessage, setSignMessage] = useState({});
  const [verifySign, setVerifySign] = useState({});
  const loading = useRef(false);
  const [firebase, setFirebase] = useState<FirebaseApp | null>(null);
  const [, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (firebase) return;
    const nextFirebase = initializeApp(firebaseConfig);
    setAnalytics(getAnalytics(nextFirebase));
    setFirebase(nextFirebase);
  }, [firebase]);

  interface TickerData {
    tick: string;
    id: number;
    dec: number;
  }

  const getUniqueTickers = (data: any) : TickerData[] =>{
    const uniqueTickers = data.reduce((acc:any, curr:any) => {
    const exists = acc.find((item:{
      tick: string,
      id: number,
      dec: number,
    }) => item.tick === curr.tick && item.id === curr.id && item.dec === curr.dec);
    if (!exists) {
      acc.push(curr);
    }
    return acc;
  }, []);
  return uniqueTickers;
}

  const fetchUtxos = useCallback(async (): Promise<any> => {
    if (loading.current || currentAddress === '') return [];

    loading.current = true;

    const pipeUnspents = await selectAllPipeUnspents({
      network: network as "mainnet" | "testnet",
      address: currentAddress,
    });

    const pipeUnspentFormatted = pipeUnspents.map((pipeUnspent) => {
      return {
        protocol: "pipe",
        tick: pipeUnspent.ticker,
        id: pipeUnspent.id,
        dec: pipeUnspent.decimals,
        amt: pipeUnspent.amount,
        status: {
          confirmed: true,
        },
      };
    });

    const uniqueTickers: TickerData[] = getUniqueTickers(pipeUnspentFormatted);
    setTokens(uniqueTickers);
  
    const ordinalsUnspents = await selectAllOrdinalsUnspents({
      network: network as "mainnet" | "testnet",
      address: currentAddress,
    });

    const ordinalsUnspentFormatted = ordinalsUnspents.map(() => {
      return {
        protocol: "ordinals",
        status: {
          confirmed: true,
        },
      };
    });

    loading.current = false;
    return [...pipeUnspentFormatted,...ordinalsUnspentFormatted];
  }, [currentAddress, network]);

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
        fetchUtxos,
        signPsbt,
        setSignPsbt,
        signMessage,
        setSignMessage,
        verifySign,
        setVerifySign,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
