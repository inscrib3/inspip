import { useMemo } from "react";
import { useApp } from "../app";
import { generateNewAddress } from "../bitcoin/wallet";

export type Address = {
  data: string[];
  address: string;
  createAddress: () => void;
  switchAddress: (address: string, index: number) => void;
}

export const useAddress = (): Address => {
  const app = useApp();

  const data = useMemo(() => {
    return app.addresses.map((_index) => {
      const account0 = generateNewAddress(app.account.rootKey, app.network, 0);
      return generateNewAddress(account0.rootKey, app.network, _index).address;
    });
  }, [app.account.rootKey, app.addresses, app.network]);

  const createAddress = async () => {
    app.setAddresses(app.addresses.concat([app.addresses.length]));
  };

  const switchAddress = (address: string, index: number) => {
    const account0 = generateNewAddress(app.account.rootKey, app.network, 0);
    app.setAccount(generateNewAddress(account0.rootKey, app.network, index));
    app.setCurrentAddress(address, index);
  };


  return {
    address: app.currentAddress,
    data,
    createAddress,
    switchAddress,
  };
};