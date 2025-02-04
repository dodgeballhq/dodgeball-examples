import { NextRequest } from "next/server";

import { TransactionsService } from "@/lib/api/transactions/service";
import { IJwtPayload, getApiAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export interface IBalancesResponse {
  [key: string]: number;
}

export async function GET(request: NextRequest) {
  let payload: IJwtPayload;
  try {
    payload = await getApiAuthUser(request);
  } catch (error) {
    return NextResponse.json({ user: null, session: null }, { status: 200 });
  }
  const balances = await TransactionsService.getAvailableBalances(payload.userId);
  return NextResponse.json(balances);
}
