import { useState, useCallback, useEffect } from "react";
import { useApp } from "../app";
import { fetchUtxos } from "../lib/node";
import { satsToBtc } from "../utils/sats-to-btc";

export type GetBalances = {
  dispatch: () => Promise<{ [key: string]: string } | undefined>;
  loading: boolean;
  data: { [key: string]: string };
};

export const useGetBalances = (): GetBalances => {
  const app = useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{
    [key: string]: string;
  }>({ btc: "0" });

  const dispatch = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    const nextData: {
      [key: string]: string;
    } = {};

    app.tokens.forEach(async (token) => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_API}/getbalance?address=${
            app.currentAddress
          }&ticker=${token.ticker}&id=${token.id}`
        );
        const { data } = await res.json();
        nextData[`${data.ticker}:${data.id}`] = data.amt;
      } catch (e) {
        setData({ sats: "", btc: "" });
        setLoading(false);
        return nextData;
      }
    });

    const utxos = await fetchUtxos(app.currentAddress);

    const sumOfSats = utxos.reduce((acc: number, utxo: { value: number; }) => {
      return acc + utxo.value;
      return acc;
    }, 0);

    nextData["btc"] = satsToBtc(sumOfSats).toString();

    setData(nextData);
    setLoading(false);
    return nextData;
  }, [app.currentAddress, app.tokens, loading]);

  useEffect(() => {
    dispatch();
  }, []);

  return {
    dispatch,
    loading,
    data,
  };
};
