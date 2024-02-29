import { useState, useCallback } from "react";
import { importWallet, importWalletFromWif } from "../bitcoin/wallet";
import { saveWallet } from "../bitcoin/wallet-storage";
import { useApp } from "../app";
import { getNetwork } from "../bitcoin/helpers";

export type RestoreWallet = {
  dispatch: (mnemonic: string, password: string) => Promise<any>;
  loading: boolean;
  data?: { network: string; rootKey: any; mnemonic: string; account: any; internalPubkey: any; address: string; output: any; };
};

export const useRestoreWallet = (): RestoreWallet => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ network: string; rootKey: any; mnemonic: string; account: any; internalPubkey: any; address: string; output: any; } | undefined>();
  const app = useApp();

  const dispatch = useCallback(
    async (mnemonic: string, password: string) => {
      if (loading) return;

      setLoading(true);

      let wallet;
      const formattedMnemonic = mnemonic?.split(' ').filter((el:any)=>el !== '');

      const isMnemo = formattedMnemonic.length === 12;

      if (isMnemo) {
        wallet = importWallet(formattedMnemonic.join(' '), getNetwork(app.network));
      } else {
        wallet = importWalletFromWif(mnemonic, getNetwork(app.network));
      }

      saveWallet(wallet.mnemonic, app.network, wallet.address, [0], password);
      setData({...wallet, network: app.network});
  
      app.setAccount(wallet);
      app.setNetwork(app.network);
      app.setCurrentAddress(wallet.address, 0)
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
