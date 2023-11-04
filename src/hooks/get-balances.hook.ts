import { useState, useCallback, useEffect } from "react";
import { useApp } from "../app";
import { bigIntToString, parseStringToBigInt } from "../bitcoin/helpers";
import { cleanFloat } from "../utils/clean-float";

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
        return acc + utxo.value;
      },
      0
    );

    for (const utxo of utxos.filter((u) => !!u.tick)) {
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

  useEffect(() => {
    dispatch();
  }, []);

  return {
    dispatch,
    loading,
    data,
  };
};
