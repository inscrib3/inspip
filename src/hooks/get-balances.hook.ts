import { useState, useCallback, useEffect } from "react";
import { useApp } from "../app";

export type GetBalances = {
  dispatch: (
    name: string
  ) => Promise<{ sats: string; btc: string; [key: string]: string }>;
  loading: boolean;
  data: { sats: string; btc: string; [key: string]: string };
};

export const useGetBalances = (): GetBalances => {
  const app = useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{
    sats: string;
    btc: string;
    [key: string]: string;
  }>({ sats: "0", btc: "0" });

  const dispatch = useCallback(async () => {
    if (loading || !app.name) return;
    setLoading(true);
    const res = await fetch(
      `${import.meta.env.VITE_APP_API}/wallet/balance/${app.name}`
    );
    const data = await res.json();

    if (data.error) {
      setData({ sats: "", btc: "" });
      setLoading(false);
      return data;
    }

    setData(data);
    setLoading(false);
    return data;
  }, [loading, app.name]);

  useEffect(() => {
    dispatch();
  }, []);

  return {
    dispatch,
    loading,
    data,
  };
};
