import { getApiAuthUser, IJwtPayload } from "@/lib/auth";
import { executeDodgeballEvent } from "@/lib/dodgeball-extensions/server-helpers";
import { IExecuteServerEventRequest, IExecuteServerEventResult } from "@/lib/dodgeball-extensions/server-types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse<IExecuteServerEventResult>> {
  try {
    // Parse Request Body
    const executeParams = (await request.json()) as IExecuteServerEventRequest;
    // Add User/Session from auth to Request if not already provided
    let jwt: IJwtPayload;
    try {
      jwt = await getApiAuthUser(request);
      const userId = jwt.userId;
      const sessionId = jwt.sessionId;
      if (userId && !executeParams.userId) {
        executeParams.userId = userId;
      }
      if (sessionId && !executeParams.sessionId) {
        executeParams.sessionId = sessionId;
      }
    } catch (error) {
      console.log("Unable to get user/session from request");
    }
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
