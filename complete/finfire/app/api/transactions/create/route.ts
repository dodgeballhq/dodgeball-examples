import { NextRequest } from "next/server";

import { TransactionsService } from "@/lib/api/transactions/service";
import { IJwtPayload, getApiAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let payload: IJwtPayload;
  try {
    payload = await getApiAuthUser(request);
  } catch (error) {
    return NextResponse.json({ user: null, session: null }, { status: 200 });
  }
  try {
    const requestBody = await request.json();
    console.log("Request body:", requestBody);
    const transaction = await TransactionsService.createTransaction(requestBody);
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}