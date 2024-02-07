import { useState, useCallback } from "react";
import { useApp } from "../app";
import { transferPipe } from "../transfer/transfer-pipe";
import { stringFromBigInt } from "../bitcoin/helpers";

export type SendTokens = {
  dispatch: (address: string, ticker: string, id: string, amount: string, fee_rate: string) => Promise<{
    hex: string;
    vin: any[];
    vout: any[];
    fee: string;
    ticker: string;
    id: string;
    amount: string;
    change: string;
    sats: string;
    sats_change: string;
  } | undefined>
  loading: boolean;
  data?: {
    hex: string;
    vin: any[];
    vout: any[];
    fee: string;
    ticker: string;
    id: string;
    amount: string;
    change: string;
    sats: string;
    sats_change: string;
  };
};

export const useSendTokens = (): SendTokens => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{
    hex: string;
    vin: any[];
    vout: any[];
    fee: string;
    ticker: string;
    id: string;
    amount: string;
    change: string;
    sats: string;
    sats_change: string;
  }>();
  const app = useApp();

  const dispatch = useCallback(
    async (address: string, ticker: string, id: string, amount: string, fee_rate: string) => {
      if (loading) return;
      setLoading(true);

      const deployment = await app.tokens.filter((token) => token.tick === ticker.toLowerCase() && token.id === parseInt(id))[0];

      try {
        const res = await transferPipe({
          privateKey: app.account.account.privateKey as Uint8Array,
          from: app.currentAddress,
          to: address,
          amount: stringFromBigInt(amount, deployment.dec).toString(),
          feerate: fee_rate,
          network: app.network as "mainnet" | "testnet",
          ticker,
          id,
          decimals: deployment.dec.toString(),
        });
  
        setData(res);

        return res;
      } catch (e) {
        setLoading(false);
        throw e;
      }
    },
    [app, loading]
  );

  return {
    dispatch,
    loading,
    data,
  };
};
