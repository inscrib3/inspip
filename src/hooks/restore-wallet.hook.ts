import { useState, useCallback } from "react";

export type RestoreWallet = {
  dispatch: (name: string, phrase: string) => Promise<{ address: string; mnemonic: string }>;
  loading: boolean;
  data?: { address: string; mnemonic: string };
};

export const useRestoreWallet = (): RestoreWallet => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ address: string; mnemonic: string }>();

  const dispatch = useCallback(
    async (name: string, phrase: string) => {
      if (loading) return;
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_APP_API}/wallet/restore`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, phrase }),
        }
      );
      const data = await res.json();
      setData(data);
      setLoading(false);
      return data;
    },
    [loading]
  );

  return {
    dispatch,
    loading,
    data,
  };
};
