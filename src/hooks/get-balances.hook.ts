import { useState, useCallback, useEffect } from "react";
import { useApp } from "../app";
import { bigIntToString, parseStringToBigInt } from "../bitcoin/helpers";
import { cleanFloat } from "../utils/clean-float";
import { getUnspents } from "../transfer/get-unspents";

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

    const utxos = await app.lightFetchUtxos();

    const sats = ((await getUnspents({network:app.network as "mainnet" | "testnet",cursor:null,address:app.currentAddress})).balance)/Math.pow(10,8);

    for (const utxo of utxos.filter((u:any) => u.protocol === "pipe")) {
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

    //nextData["ordinals"] = utxos.filter((u:any) => u.protocol === "ordinals").length;

    nextData["btc"] = sats.toString();

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
