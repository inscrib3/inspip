import { useState, useCallback } from "react";
import { useApp } from "../app";
import { cleanFloat } from "../utils/clean-float";
import { bigIntToString, parseStringToBigInt } from "../bitcoin/helpers";

export type SafeBalances = {
  dispatch: () => Promise<{ [key: string]: string } | undefined>;
  loading: boolean;
  data: { [key: string]: string };
};

export const useSafeBalances = (): SafeBalances => {
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

    let utxos = await app.fetchUtxos();

    utxos = utxos.filter((u) => u.status.confirmed);

    const sumOfSats = utxos.reduce(
      (acc: number, utxo) => {
        if (utxo.protocol) return acc;
        return acc + utxo.value;
      },
      0
    );

    for (const utxo of utxos.filter((u) => u.protocol === "pipe")) {
      try {
        if (typeof nextData[utxo.tick + ":" + utxo.id] === "undefined") {
          nextData[utxo.tick + ":" + utxo.id] = "0";
        }

        if (typeof utxo.amt === 'undefined') continue;
        if (typeof utxo.dec === 'undefined') continue;

        nextData[utxo.tick + ":" + utxo.id] = cleanFloat(bigIntToString(
          parseStringToBigInt(
            nextData[utxo.tick + ":" + utxo.id],
            utxo.dec
          ) + BigInt(utxo.amt),
          utxo.dec
          )
        );
      } catch (e) {
        console.error(e);
      }
    }

    nextData["btc"] = cleanFloat(bigIntToString(BigInt(sumOfSats), 8));

    setData(nextData);
    setLoading(false);
    return nextData;
  }, [app, loading]);

  return {
    dispatch,
    loading,
    data,
  };
};
