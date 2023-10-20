import { createContext, useState } from 'react';
import { bitcoin } from "../lib/bitcoin-lib";

export const AppContext = createContext<{
  network: any,
  setNetwork: (network: any) => void,
  name: string,
  setName: (name: string) => void,
  address: string,
  setAddress: (address: string) => void,
  addresses: string[],
  setAddresses: (addresses: string[]) => void,
  feerate: number,
  setFeerate: (feerate: number) => void,
}>({
  network: bitcoin.networks.bitcoin,
  setNetwork: () => undefined,
  name: '',
  setName: () => undefined,
  address: '',
  setAddress: () => undefined,
  addresses: [],
  setAddresses: () => undefined,
  feerate: 0,
  setFeerate: () => undefined,
});

export interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = (props: AppProviderProps) => {
  const [network, setNetwork] = useState(bitcoin.networks.bitcoin);
  const [name, setName] = useState('');
  const [addresses, _setAddresses] = useState<string[]>([]);
  const [address, _setAddress] = useState('');
  const [feerate, setFeerate] = useState(0);

  const setAddresses = (addresses: string[]) => {
    _setAddresses(addresses);
    localStorage.setItem("addresses", JSON.stringify(addresses));
  };

  const setAddress = (address: string) => {
    _setAddress(address);
    localStorage.setItem("address", address);
  };

  return (
    <AppContext.Provider
      value={{
        network,
        setNetwork,
        name,
        setName,
        address,
        setAddress,
        addresses,
        setAddresses,
        feerate,
        setFeerate,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
