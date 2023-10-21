import { createContext, useState } from 'react';
import { bitcoin } from "../lib/bitcoin-lib";
import { editWallet } from '../lib/wallet';

export const AppContext = createContext<{
  network: any,
  account: any,
  setAccount: (account: any) => void,
  setNetwork: (network: any) => void,
  currentAddress: string,
  setCurrentAddress: (address: string) => void,
  addresses: number[],
  setAddresses: (addresses: number[]) => void,
  feerate: number,
  setFeerate: (feerate: number) => void,
  tokens: { ticker: string, id: string, decimals: string }[],
  setTokens: (tokens: { ticker: string, id: string, decimals: string }[]) => void,
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
});

export interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = (props: AppProviderProps) => {
  const [account, setAccount] = useState<any>({});
  const [network, setNetwork] = useState(bitcoin.networks.bitcoin);
  const [addresses, _setAddresses] = useState<number[]>([]);
  const [currentAddress, _setCurrentAddress] = useState('');
  const [feerate, setFeerate] = useState(0);
  const [tokens, setTokens] = useState<{ ticker: string, id: string, decimals: string }[]>([]);

  const setAddresses = (addresses: number[]) => {
    _setAddresses(addresses);
    editWallet('', addresses);
  };

  const setCurrentAddress = (address: string) => {
    _setCurrentAddress(address);
    editWallet(address);
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
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
