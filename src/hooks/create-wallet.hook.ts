import { useState, useCallback } from "react";
import { generateWallet } from "../lib/wallet";
import { BIP32Interface } from "bip32";
import { bitcoin } from "../lib/bitcoin-lib";

export type CreateWallet = {
  dispatch: () => Promise<any>; //{ network: any; rootKey: BIP32Interface; mnemonic: string; account: any; internalPubkey: any; address: string; output: any; } | undefined>
  loading: boolean;
  data?: { network: any; rootKey: BIP32Interface; mnemonic: string; account: any; internalPubkey: any; address: string; output: any; } | undefined;
};

export const useCreateWallet = (): CreateWallet => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ network: any; rootKey: BIP32Interface; mnemonic: string; account: any; internalPubkey: any; address: string; output: any; } | undefined>();

  const dispatch = useCallback(
    async () => {
      if (loading) return;
      setLoading(true);
      const network = bitcoin.networks.testnet
      const wallet = generateWallet(network);
      localStorage.setItem('wallet', JSON.stringify(wallet));
      setData({...wallet, network});
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
