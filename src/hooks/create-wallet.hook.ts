import { useState, useCallback } from "react";
import { generateNewAddress, generateWallet, importWallet } from "../bitcoin/wallet";
import { saveWallet } from "../bitcoin/wallet-storage";
import { useApp } from "../app";
import { getNetwork } from "../bitcoin/helpers";

export type CreateWallet = {
  dispatch: (password: string) => Promise<any>;
  loading: boolean;
  data?: { network: string; rootKey: any; mnemonic: string; account: any; internalPubkey: any; address: string; output: any; } | undefined;
};

export const useCreateWallet = (): CreateWallet => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ network: string; rootKey: any; mnemonic: string; account: any; internalPubkey: any; address: string; output: any; } | undefined>();
  const app = useApp();

  const dispatch = useCallback(
    async (password: string) => {
      if (loading) return;

      setLoading(true);

      const wallet = generateWallet(getNetwork(app.network));
      const address = generateNewAddress(wallet.rootKey, getNetwork(app.network), 0);
      saveWallet(wallet.mnemonic, app.network, address.address, [0], password);
      setData({...wallet, network: app.network});

      app.setAccount(importWallet(wallet.mnemonic, getNetwork(app.network), 0));
      app.setNetwork(app.network);
      app.setCurrentAddress(address.address, 0)
      app.setAddresses([0]);

      setLoading(false);

      return wallet;
    },
    [loading]
  );

  return {
    dispatch,
    loading,
    data,
  };
};
