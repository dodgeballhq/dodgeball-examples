import { IBalancesResponse } from "@/app/api/balances/route";
import { prisma } from "@/lib/prisma";
import { Transaction } from "@prisma/client";
import { TransactionResponse, TransactionsResponse } from "./types";
export class TransactionsService {
  static async getTransactions(userId: string, skip: number = 0, take: number = 5): Promise<TransactionsResponse> {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    });
    return TransactionsService.asResponse(transactions);
  }

  static async getAvailableBalances(userId: string): Promise<IBalancesResponse> {
    const balances = await prisma.transaction.groupBy({
      where: {
        userId,
      },
      by: ["currency"],
      _sum: {
        amount: true,
      },
    });
    const balancesResponse: IBalancesResponse = {};
    balances.forEach((balance) => {
      balancesResponse[balance.currency] = balance._sum.amount ?? 0;
    });
    return balancesResponse;
  }

  static async asResponse(transactions: Transaction[]): Promise<TransactionsResponse> {
    const transactionResponses: TransactionResponse[] = transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
      currency: transaction.currency,
      toDescription: transaction.toDescription,
      fromDescription: transaction.fromDescription,
    }));
    const transactionsResponse: TransactionsResponse = {
      transactions: transactionResponses,
    };
    return transactionsResponse;
  }

  static async createTransaction(transaction: Transaction): Promise<TransactionsResponse> {
    const createdTransaction = await prisma.transaction.create({
      data: {
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        reference: transaction.reference,
        userId: transaction.userId,
        toDescription: transaction.toDescription,
        fromDescription: transaction.fromDescription,
        id: transaction.id,
        createdAt: transaction.createdAt,
      },
    });
    const transactionsResponse = TransactionsService.asResponse([createdTransaction]);
    return transactionsResponse;
  }
}
