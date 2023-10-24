import { useState, useCallback } from "react";
import { useApp } from "../app";
import { sendSats } from "../bitcoin/wallet";
import { fetchUtxos } from "../bitcoin/node";
import { getNetwork } from "../bitcoin/helpers";

export type SendSats = {
  dispatch: (address: string, amount: string, fee_rate: string) => Promise<string | undefined>;
  loading: boolean;
  data?: any;
};

export const useSendSats = (): SendSats => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>();
  const app = useApp();

  const dispatch = useCallback(
    async (address: string, amount: string, fee_rate: string) => {
      if (loading) return;
      setLoading(true);

      const fetchedUtxos = await fetchUtxos(app.currentAddress, app.network);
      const utxos = [];

      for (const utxo of fetchedUtxos) {
        try {
          const token = await fetch(
            `${import.meta.env.VITE_SERVER_HOST}/utxo/${utxo.txid}/${utxo.vout}`
          );

          if (!token.ok) {
            utxos.push(utxo);
          }
        } catch (e) {
          console.error(e);
          utxos.push(utxo);
        }
      }

      const data = sendSats(
        app.account,
        app.currentAddress,
        utxos,
        address,
        BigInt(amount),
        BigInt(fee_rate),
        getNetwork(app.network)
      );
      
      setData(data);

      setLoading(false);
      return data;
    },
    [app.account, app.currentAddress, app.network, loading]
  );

  return {
    dispatch,
    loading,
    data,
  };
};
