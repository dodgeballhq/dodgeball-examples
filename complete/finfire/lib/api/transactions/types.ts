
export interface TransactionResponse {
  id: string;
  amount: number;
  description: string;
  toDescription: string;
  fromDescription: string;
  currency: string;
  createdAt: string;
}

export interface TransactionsResponse {
  transactions: TransactionResponse[];
}
