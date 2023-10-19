// name, address, ticker, id, amount, fee_rate

import { useState, useCallback } from "react";
import { useApp } from "../app";

export type SendTokens = {
  dispatch: (name: string, address: string, ticker: string, id: string, amount: string, fee_rate: string) => Promise<{ address: string; mnemonic: string }>
  loading: boolean;
  data?: { address: string; mnemonic: string };
};

export const useSendTokens = (): SendTokens => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ address: string; mnemonic: string }>();
  const app = useApp();

  const dispatch = useCallback(
    async (name: string, address: string, ticker: string, id: string, amount: string, fee_rate: string) => {
      if (loading) return;
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_APP_API}/wallet/send-tokens`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, address, ticker, id, amount, fee_rate, changeAddress: app.address }),
        }
      );
      const data = await res.json();
      setData(data);
      setLoading(false);
      return data;
    },
    [app.address, loading]
  );

  return {
    dispatch,
    loading,
    data,
  };
};
