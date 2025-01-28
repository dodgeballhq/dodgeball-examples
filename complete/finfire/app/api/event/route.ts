import { executeDodgeballEvent } from "@/lib/dodgeball-extensions/server-helpers";
import { IExecuteServerEventRequest, IExecuteServerEventResult } from "@/lib/dodgeball-extensions/server-types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse<IExecuteServerEventResult>> {
  try {
    // Create Request
    const executeParams = (await request.json()) as IExecuteServerEventRequest;

    // Run the execution function
    const executionResult = await executeDodgeballEvent(executeParams);

    // Return Response
    const correctStatus = 201;
    return NextResponse.json(executionResult, { status: correctStatus });
  } catch (error) {
    // Handle Error
    const errorResponse: IExecuteServerEventResult = { success: false, errorMessage: "Error processing event request" };
    const errorStatus = 500;
    return NextResponse.json(errorResponse, { status: errorStatus });
  }
}
