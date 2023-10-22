export type Transaction = {
  txid: string;
  hex?: string;
  timestamp: number;
  value?: bigint;
  address: string;
  description: string;
  confirmed: boolean;
};

export const save = (transaction: Transaction) => {
  const transactionsJSON = localStorage.getItem("transactions");
  const transactions: Transaction[] = transactionsJSON ? JSON.parse(transactionsJSON) : [];
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

export const load = () => {
  const transactionsJSON = localStorage.getItem("transactions");
  const transactions: Transaction[] = transactionsJSON ? JSON.parse(transactionsJSON) : [];

  return transactions;
}
