import { Transaction } from "@prisma/client";

export interface TransactionsResponse {
  transactions: Transaction[];
}
