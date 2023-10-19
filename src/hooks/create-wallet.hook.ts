import { useState, useCallback } from "react";
import { generateWallet } from "../lib/wallet";
import { BIP32Interface } from "bip32";

export type CreateWallet = {
  dispatch: (name: string) => Promise<{ network: any; rootKey: BIP32Interface; mnemonic: string; account: any; internalPubkey: any; address: string; output: any; } | undefined>
  loading: boolean;
  data?: { network: any; rootKey: BIP32Interface; mnemonic: string; account: any; internalPubkey: any; address: string; output: any; } | undefined;
};

export const useCreateWallet = (): CreateWallet => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ network: any; rootKey: BIP32Interface; mnemonic: string; account: any; internalPubkey: any; address: string; output: any; } | undefined>();

  const dispatch = useCallback(
    async (name: string) => {
      if (loading) return;
      setLoading(true);
      const wallet = generateWallet();
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
