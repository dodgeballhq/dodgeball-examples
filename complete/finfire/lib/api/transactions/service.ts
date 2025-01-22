import { Transaction } from "@prisma/client";

export class TransactionsService {
  static async getTransactions(userId: string, skip: number = 0, take: number = 5): Promise<Transaction[]> {
    const response = await fetch(`api/user/${userId}/transactions?skip=${skip}&take=${take}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to get transactions");
    }

    return response.json() as Promise<Transaction[]>;
  }
}
