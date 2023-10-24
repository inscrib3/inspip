import { useMemo } from "react";
import { useApp } from "../app";
import { generateNewAddress } from "../bitcoin/wallet";
import { getNetwork } from "../bitcoin/helpers";

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
      // @todo check it
      const account0 = generateNewAddress(app.account.rootKey, getNetwork(app.network), 0);
      return generateNewAddress(account0.rootKey, getNetwork(app.network), _index).address;
    });
  }, [app.account.rootKey, app.addresses, app.network]);

  const createAddress = async () => {
    app.setAddresses(app.addresses.concat([app.addresses.length]));
  };

  const switchAddress = (address: string, index: number) => {
    // @todo check it
    const account0 = generateNewAddress(app.account.rootKey, getNetwork(app.network), 0);
    app.setAccount(generateNewAddress(account0.rootKey, getNetwork(app.network), index));
    app.setCurrentAddress(address, index);
  };

  return {
    address: app.currentAddress,
    data,
    createAddress,
    switchAddress,
  };
}
