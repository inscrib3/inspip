import { useState, useCallback } from "react";
import { useApp } from "../app";
import { transferSats } from "../transfer/transfer-sats";
import { parseStringToBigInt } from "../bitcoin/helpers";

export type SendSats = {
  dispatch: (address: string, amount: string, fee_rate: string) => Promise<{
    hex: string;
    vin: any[];
    vout: any[];
    fee: string;
    sats: string;
    sats_change: string;
  } | undefined>;
  loading: boolean;
  data?: {
    hex: string;
    vin: any[];
    vout: any[];
    fee: string;
    sats: string;
    sats_change: string;
  };
};

export const useSendSats = (): SendSats => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{
    hex: string;
    vin: any[];
    vout: any[];
    fee: string;
    sats: string;
    sats_change: string;
  }>();
  const app = useApp();

  const dispatch = useCallback(
    async (address: string, amount: string, fee_rate: string) => {
      if (loading) return;
      setLoading(true);

      try {
        const res = await transferSats({
          privateKey: app.account.account.privateKey as Uint8Array,
          from: app.currentAddress,
          to: address,
          amount: parseStringToBigInt(amount, 8).toString(),
          feerate: fee_rate,
          network: app.network as "mainnet" | "testnet",
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
