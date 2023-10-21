import { useState, useCallback } from "react";
import { useApp } from "../app";
import { sendSats } from "../lib/wallet";
import { fetchUtxos } from "../lib/node";
import { save } from "./show-transactions.hook";

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

      const fetchedUtxos = await fetchUtxos(app.currentAddress);
      const utxos = [];

      for (const utxo of fetchedUtxos) {
        try {
          const token = await fetch(
            `${import.meta.env.VITE_APP_API}/utxo/${utxo.txid}/${utxo.vout}`
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
        utxos,
        address,
        BigInt(amount),
        BigInt(fee_rate),
        app.network
      );
      save({txid: data, address: app.currentAddress, description: `Sent ${amount} sats to ${address}`, timestamp: Date.now().toLocaleString()});
      setData(data);

      setLoading(false);
      return data;
    },
    [app.currentAddress, loading]
  );

  return {
    dispatch,
    loading,
    data,
  };
};
