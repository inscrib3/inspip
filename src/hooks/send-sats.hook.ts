import { useState, useCallback } from "react";
import { useApp } from "../app";
import { sendSats } from "../bitcoin/wallet";
import { getNetwork } from "../bitcoin/helpers";

export type SendSats = {
  dispatch: (address: string, amount: string, fee_rate: string) => Promise<string | undefined>;
  loading: boolean;
  data?: any;
};

export const useSendSats = (): SendSats => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>();
  const app = useApp();

  const dispatch = useCallback(
    async (address: string, amount: string, fee_rate: string) => {
      if (loading) return;
      setLoading(true);

      let utxos = await app.fetchUtxos();
      utxos = utxos.filter((u) => !u.tick && u.status.confirmed);

      const data = sendSats(
        app.account,
        app.currentAddress,
        utxos,
        address,
        BigInt(amount),
        BigInt(fee_rate),
        getNetwork(app.network)
      );
      
      setData(data);

      setLoading(false);
      return data;
    },
    [app, loading]
  );

  return {
    dispatch,
    loading,
    data,
  };
};
