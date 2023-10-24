import { useState, useCallback } from "react";
import { useApp } from "../app";
import { sendTokens } from "../bitcoin/wallet";

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

      const utxos = await app.fetchUtxos();
      const deployment = await app.tokens.filter((token) => token.tick === ticker.toLowerCase() && token.id === parseInt(id))[0];
      const data = await sendTokens(app.account, app.currentAddress, utxos, address, ticker, id, deployment.dec, amount, fee_rate, app.network)

      setData(data);

      setLoading(false);
      return data;
    },
    [app, loading]
  );

  return {
    dispatch,
    loading,
    data,
  };
};
