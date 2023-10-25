import { useState, useCallback, useEffect } from "react";
import { useApp } from "../app";
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

    const utxos = await app.fetchUtxos();

    const sumOfSats = utxos.reduce(
      (acc: number, utxo) => {
        if (utxo.tick) return acc;
        return acc + utxo.value;
      },
      0
    );

    for (const utxo of utxos.filter((u) => !!u.tick)) {
      try {
        if (typeof nextData[utxo.tick + ":" + utxo.id] === "undefined") {
          nextData[utxo.tick + ":" + utxo.id] = "0";
        }

        nextData[utxo.tick + ":" + utxo.id] =
          (parseFloat(nextData[utxo.tick + ":" + utxo.id]) + (parseInt(utxo.amt || '0') / Math.pow(10, utxo.dec || 0))).toString();
      } catch (e) {
        console.error(e);
      }
    }

    nextData["btc"] = satsToBtc(sumOfSats).toString();

    setData(nextData);
    setLoading(false);
    return nextData;
  }, [app, loading]);

  useEffect(() => {
    setTimeout(() => {
      dispatch();
    }, 1000);
    const interval = setInterval(dispatch, 10000);
    return () => clearInterval(interval);
  }, []);

  return {
    dispatch,
    loading,
    data,
  };
};
