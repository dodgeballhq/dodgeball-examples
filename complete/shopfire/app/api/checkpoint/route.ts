import { executeDodgeballCheckpoint, getErrorResponse } from "@/lib/dodgeball-extensions/server-helpers";
import {
  IExecuteServerCheckpointRequest,
  IExecuteServerCheckpointResult,
} from "@/lib/dodgeball-extensions/server-types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse<IExecuteServerCheckpointResult>> {
  try {
    // Create Request
    const executeParams = (await request.json()) as IExecuteServerCheckpointRequest;
    const requestIp = request.headers.get("x-forwarded-for")?.split(",")?.at(0)?.trim() ?? "UNKNOWN_IP";

    // Run the execution function
    const executionResult = await executeDodgeballCheckpoint(executeParams, requestIp);

    // Return Response
    const correctStatus = 201;
    return NextResponse.json(executionResult, { status: correctStatus });
  } catch (error) {
    // Handle Error
    const errorResponse = getErrorResponse("Error processing checkpoint request");
    const errorStatus = 500;
    return NextResponse.json(errorResponse, { status: errorStatus });
  }
}
