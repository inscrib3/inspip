import { useState, useCallback } from "react";
import { useApp } from "../app";
import { sendTokens } from "../lib/wallet";
import { fetchUtxos } from "../lib/node";

export type SendTokens = {
  dispatch: (address: string, ticker: string, id: string, amount: string, fee_rate: string) => Promise<any>
  loading: boolean;
  data?: any;
};

export const useSendTokens = (): SendTokens => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>();
  const app = useApp();

  const dispatch = useCallback(
    async (address: string, ticker: string, id: string, amount: string, fee_rate: string) => {
      if (loading) return;
      setLoading(true);

      const utxos = await fetchUtxos(app.currentAddress)
      const data = await sendTokens(app.account, utxos, address, ticker, id, amount, fee_rate, app.network)
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
