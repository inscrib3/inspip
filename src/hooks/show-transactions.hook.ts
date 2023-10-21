import { useState, useCallback } from "react";

export type ShowTransactions = {
  dispatch: () => Promise<any>;
  loading: boolean;
  data?: any;
};

export const useShowTransactions = (): ShowTransactions => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>();

  const dispatch = useCallback(
    async () => {
      if (loading) return;

      setLoading(true);

      const transactions = localStorage.getItem("transactions");
      setData(transactions);

      setLoading(false);

      return transactions;
    },
    [loading]
  );

  return {
    dispatch,
    loading,
    data,
  };
};
