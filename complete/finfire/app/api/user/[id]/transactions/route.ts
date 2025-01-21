import { TransactionsResponse } from "@/lib/api/transactions/types";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET(request: Request, { params }: { params: { userId: string; skip: number; take: number } }) {
  const { userId, skip, take } = params;
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      take: take,
      skip: skip,
    });
    return NextResponse.json({ transactions } as TransactionsResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
