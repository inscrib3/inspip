import { createContext, useCallback, useEffect, useState } from 'react';
import { bitcoin } from "../bitcoin/lib/bitcoin-lib";
import { editWallet } from '../bitcoin/wallet-storage';

export type Utxo = {
  txid: string,
  hex: string,
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
  network: any,
  account: any,
  setAccount: (account: any) => void,
  setNetwork: (network: any) => void,
  currentAddress: string,
  setCurrentAddress: (address: string, index: number) => void,
  addresses: number[],
  setAddresses: (addresses: number[]) => void,
  feerate: number,
  setFeerate: (feerate: number) => void,
  tokens: { ticker: string, id: string, decimals: string }[],
  setTokens: (tokens: { ticker: string, id: string, decimals: string }[]) => void,
  utxos: Utxo[],
  fetchUtxos: () => Promise<Utxo[]>,
}>({
  account: {},
  setAccount: () => undefined,
  network: bitcoin.networks.bitcoin,
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

export interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = (props: AppProviderProps) => {
  const [account, setAccount] = useState<any>({});
  const [network, setNetwork] = useState(bitcoin.networks.bitcoin);
  const [addresses, _setAddresses] = useState<number[]>([]);
  const [currentAddress, _setCurrentAddress] = useState<string>('');
  const [feerate, setFeerate] = useState(0);
  const [tokens, setTokens] = useState<{ ticker: string, id: string, decimals: string }[]>([]);

  const [utxos, setUtxos] = useState<Utxo[]>([]);

  const fetchUtxos = useCallback(async (): Promise<Utxo[]> => {
    if (!currentAddress) return [];

    try {
      const utxoRes = await fetch(`https://mempool.space/api/address/${currentAddress}/utxo`);

      if (!utxoRes.ok) {
        throw new Error('Failed to fetch utxos');
      }

      const satsUtxo: Utxo[] = await utxoRes.json();

      const tokensUtxosRes = await fetch(`${import.meta.env.VITE_SERVER_HOST}/utxos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          utxos: satsUtxo,
        }),
      });

      if (!tokensUtxosRes.ok) {
        throw new Error('Failed to fetch tokens utxos');
      }

      const tokensUtxos: Utxo[] = await tokensUtxosRes.json();

      const uniqueTickers: {
        ticker?: string,
        id?: number,
      }[] = [];

      tokensUtxos.forEach((utxo) => {
        if (uniqueTickers.find((ticker) => ticker.ticker === utxo.tick && ticker.id === utxo.id)) return;
        uniqueTickers.push({
          ticker: utxo.tick,
          id: utxo.id,
        });
      });

      const deploymentRes = await fetch(`${import.meta.env.VITE_SERVER_HOST}/deployments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tickers: uniqueTickers,
        }),
      });

      if (!deploymentRes.ok) {
        throw new Error('Failed to fetch deployments');
      }

      const deployments: Utxo[] = await deploymentRes.json();

      const nextUtxos: Utxo[] =  satsUtxo.map((utxo) => {
        const tokenUtxo = tokensUtxos.find((tokenUtxo) => tokenUtxo.txid === utxo.txid && tokenUtxo.vout === utxo.vout);
        const deployment = deployments.find((deployment) => deployment.id === tokenUtxo?.id && deployment.tick === tokenUtxo?.tick);

        return {
          ...utxo,
          tick: tokenUtxo?.tick,
          id: tokenUtxo?.id,
          amt: tokenUtxo?.amt,
          dec: deployment?.dec,
        };
      });

      setUtxos(nextUtxos);
      return nextUtxos;
    } catch (e) {
      console.error(e);
      setUtxos([]);
      return []; 
    }

    return [];
  }, [currentAddress]);

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
