import { Transaction } from "@prisma/client";

export class TransactionsService {
  static async getTransactions(userId: string, skip: number = 0, take: number = 5): Promise<Transaction[]> {
    return [];
  }
}
