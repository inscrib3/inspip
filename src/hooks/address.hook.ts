import { useMemo } from "react";
import { useCreateAddress } from ".";
import { useApp } from "../app";
import { generateNewAddress } from "../lib/wallet";

export type Address = {
  data: string[];
  address: string;
  createAddress: () => void;
  switchAddress: (address: string) => void;
  setAddress: (address: string) => void;
}

export const useAddress = (): Address => {
  const app = useApp();

  const data = useMemo(() => {
    return app.addresses.map((_index) => {
      return generateNewAddress(app.account.rootKey, app.network, _index).address;
    });
  }, [app.account.rootKey, app.addresses, app.network]);

  const createAddress = async () => {
    app.setAddresses(app.addresses.concat([app.addresses.length]));
  };

  const switchAddress = (address: string) => {
    app.setCurrentAddress(address);
  };

  const setAddress = (address: string) => {
    app.setCurrentAddress(address);
  };

  return {
    address: app.currentAddress,
    data,
    createAddress,
    switchAddress,
    setAddress,
  };
};