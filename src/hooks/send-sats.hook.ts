// name, address, ticker, id, amount, fee_rate

import { useState, useCallback } from "react";
import { useApp } from "../app";
import { sendSats } from "../lib/wallet";
import { fetchUtxos } from "../lib/node";

export type SendSats = {
  dispatch: (address: string, amount: string, fee_rate: string) => Promise<any>
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

      const utxos = await fetchUtxos(app.currentAddress)
      const data = sendSats(app.account, utxos, address, BigInt(amount), BigInt(fee_rate), app.network)
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
