import { useState, useCallback } from "react";
import { importWallet } from "../lib/wallet";
import { BIP32Interface } from "bip32";

export type RestoreWallet = {
  dispatch: (name: string, phrase: string) => Promise<{ network: any; rootKey: BIP32Interface; mnemonic: string; account: any; internalPubkey: any; address: string; output: any; } | undefined>;
  loading: boolean;
  data?: { network: any; rootKey: BIP32Interface; mnemonic: string; account: any; internalPubkey: any; address: string; output: any; };
};

export const useRestoreWallet = (): RestoreWallet => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ network: any; rootKey: BIP32Interface; mnemonic: string; account: any; internalPubkey: any; address: string; output: any; } | undefined>();

  const dispatch = useCallback(
    async (name: string, phrase: string) => {
      if (loading) return;
      setLoading(true);
      const wallet = importWallet(phrase);
      localStorage.setItem('wallet', JSON.stringify(wallet));
      setData(wallet);
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
