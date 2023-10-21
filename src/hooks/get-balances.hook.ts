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

    const utxos = await fetchUtxos(app.currentAddress);

    const sumOfSats = utxos.reduce(
      (acc: number, utxo: { txid: string; vout: number; value: number }) => {
        return acc + utxo.value;
        return acc;
      },
      0
    );

    for (const utxo of utxos) {
      try {
        const token = await fetch(
          `${import.meta.env.VITE_APP_API}/utxo/${utxo.txid}/${utxo.vout}`
        );

        if (!token.ok) continue;

        const data = await token.json();

        const deployment = await fetch(
          `${import.meta.env.VITE_APP_API}/getdeployment?ticker=${data.tick}&id=${data.id}`
        );

        if (!deployment.ok) continue;

        const deploymentData = await deployment.json();

        if (typeof nextData[data.tick + ":" + data.id] === "undefined") {
          nextData[data.tick + ":" + data.id] = "0";
        }

        nextData[data.tick + ":" + data.id] =
          (parseInt(nextData[data.tick + ":" + data.id]) + (parseInt(data.amt) / Math.pow(10, deploymentData.data.dec))).toString();
      } catch (e) {
        console.error(e);
      }
    }

    nextData["btc"] = satsToBtc(sumOfSats).toString();

    setData(nextData);
    setLoading(false);
    return nextData;
  }, [app.currentAddress, loading]);

  useEffect(() => {
    dispatch();
  }, []);

  return {
    dispatch,
    loading,
    data,
  };
};
