import { useState, useCallback } from "react";
import { useApp } from "../app";
import { generateNewAddress } from "../lib/wallet";

export type CreateAddress = {
  dispatch: () => Promise<{ address: string }>;
  loading: boolean;
  data?: { address: string };
  error?: string;
};

export const useCreateAddress = (): CreateAddress => {
  const app = useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ address: string }>();
  const [error, setError] = useState<string>();

  const dispatch = useCallback(
    async () => {
      if (loading || !app.name) return;
      setError(undefined);
      setLoading(true);
      //generateNewAddress()
      const res = await fetch(
        `${import.meta.env.VITE_APP_API}/wallet/create-address`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: app.name }),
        }
      );
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      
      setData(data);
      setLoading(false);
      return data;
    },
    [loading, app.name]
  );

  return {
    dispatch,
    loading,
    data,
    error,
  };
};
