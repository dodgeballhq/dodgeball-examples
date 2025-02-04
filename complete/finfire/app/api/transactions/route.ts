import { TransactionsService } from "@/lib/api/transactions/service";
import { IJwtPayload, getApiAuthUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  let payload: IJwtPayload;
  try {
    payload = await getApiAuthUser(request);
  } catch (error) {
    return NextResponse.json({ user: null, session: null }, { status: 200 });
  }
  const transactions = await TransactionsService.getTransactions(payload.userId);
  return NextResponse.json(transactions);
}



