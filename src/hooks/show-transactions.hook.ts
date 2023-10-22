export type Transaction = {
  txid: string;
  from: string;
  to: string;
  timestamp: number;
  confirmed: boolean;
  amount: string;
  token?: string;
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
