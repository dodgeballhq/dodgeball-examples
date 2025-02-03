import cors from "cors";
import * as dotenv from "dotenv";
import express, { Request, Response } from "express";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.options("*", cors());

const port = process.env.PORT || 3020;

import { Dodgeball, DodgeballApiVersion } from "@dodgeball/trust-sdk-server";
import { ICheckpointOptions } from "@dodgeball/trust-sdk-server/dist/types/types";
import { getIp } from "./helpers";
import {
  IExecuteDodgeballCheckpointParams,
  IProcessDodgeballCheckpointApiParams,
  IProcessDodgeballCheckpointResult,
  IProcessDodgeballServerEventApiParams,
  IProcessDodgeballServerEventResult,
} from "./interfaces";

// Initialize the SDK with your secret API key.
const dodgeball = new Dodgeball(process.env.DODGEBALL_PRIVATE_API_KEY ?? "UNSET_PRIVATE_API_KEY", {
  apiVersion: DodgeballApiVersion.v1,
  apiUrl: process.env.DODGEBALL_API_URL ?? undefined,
});

app.get("/", (req: Request, res: Response) => {
  res.send("Index Page");
});

const executeDodgeballCheckpoint = async (
  params: IExecuteDodgeballCheckpointParams,
  // The IP address of the device making the request
  // You can use the request object (for example an Express.js requeest) to get the IP address
  ipAddress: string,
  // (Optional if you have a valid sourceToken) Unique identifier for the session
  sessionId?: string,
  // (Optional) Unique identifier for the user, used to track the user's risk profile
  userId?: string
): Promise<IProcessDodgeballCheckpointResult> => {
  try {
    const checkpointPayload: ICheckpointOptions = {
      checkpointName: params.checkpointName,
      event: {
        ip: ipAddress,
        data: {
          ...(params.payload ?? {}),
          exampleValueFromBackendOnly: "EXAMPLE_VALUE",
        },
      },
    };
    if (params.sourceToken) {
      checkpointPayload.sourceToken = params.sourceToken;
    }
    if (sessionId) {
      checkpointPayload.sessionId = sessionId;
    }
    if (userId) {
      checkpointPayload.userId = userId;
    }
    if (params.verificationId) {
      checkpointPayload.useVerificationId = params.verificationId;
    }
    const checkpointResponse = await dodgeball.checkpoint(checkpointPayload);

    // Handle the response from the checkpoint
    if (dodgeball.isAllowed(checkpointResponse)) {
      // Proceed with placing the order
      return {
        success: true,
        status: "isAllowed",
        verification: checkpointResponse.verification,
      };
    } else if (dodgeball.isRunning(checkpointResponse)) {
      // If the outcome is pending, send the verification to the frontend to do additional checks (such as MFA, KYC)
      return {
        success: true,
        status: "isRunning",
        verification: checkpointResponse.verification,
      };
    } else if (dodgeball.isDenied(checkpointResponse)) {
      // If the request is denied, you can return the verification to the frontend to display a reason message
      return {
        success: true,
        status: "isDenied",
        verification: checkpointResponse.verification,
      };
    } else {
      // If the checkpoint failed, decide how you would like to proceed. You can return the error, choose to proceed, retry, or reject the request.
      return {
        success: true,
        status: "isError",
        verification: checkpointResponse.verification,
        errorMessage: JSON.stringify(checkpointResponse.errors),
      };
    }
  } catch (error) {
    // Handle any errors that occur during the checkpoint execution, usually configuration related
    let errorMessage = "Invocation error, likely configuration";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      status: "isError",
      verification: null,
      errorMessage,
    };
  }
};

app.post("/checkpoint", async (req: Request, res: Response) => {
  console.log("\n(POST /checkpoint)");
  try {
    // In moments of risk, call a checkpoint within Dodgeball to verify the request is allowed to proceed
    const requestBody: IProcessDodgeballCheckpointApiParams = req.body;
    const requestIp = getIp(req);
    console.log("CHECKPOINT REQUEST", requestBody, requestIp);
    const executionResult = await executeDodgeballCheckpoint(
      {
        checkpointName: requestBody.checkpointName,
        payload: requestBody.payload,
        sourceToken: requestBody.sourceToken,
        verificationId: requestBody.verificationId,
      },
      requestIp,
      // You can choose to use the session id from the request body, or override it here
      // The session id is only required if you do not have a source token
      requestBody.sessionId,
      // You can choose to use the user id from the request body, or override it here
      // The user id optional, but can be used to track the user's risk profile
      requestBody.userId
    );
    console.log("CHECKPOINT RESULT", executionResult);
    return res.status(200).json(executionResult);
  } catch (error) {
    // Any error that gets here is unexpected
    // Most checkpoint errors will be handled by the executeDodgeballCheckpoint method get a 200 response
    console.error("CHECKPOINT ERROR", error);
    return res.status(500).json({ success: false, status: "isError", errorMessage: "Error at /checkpoint" });
  }
});

const sendDodgeballServerEvent = async (
  params: IProcessDodgeballServerEventApiParams
): Promise<IProcessDodgeballServerEventResult> => {
  try {
    // Send an event to Dodgeball to be logged and analyzed
    await dodgeball.event({
      // The source token is required to send an event
      sourceToken: params.sourceToken,
      // You can choose to use the session id from the request body, or override it here
      // The session id optional, but can be used to help identify the session
      sessionId: params.sessionId,
      // You can choose to use the user id from the request body, or override it here
      // The user id optional, but can be used to track the user's risk profile
      userId: params.userId,
      event: {
        type: params.eventName,
        data: params.payload,
        eventTime: Date.now(),
      },
    });
    return { success: true };
  } catch (error) {
    // Handle any errors that occur during the event execution, usually configuration related
    let errorMessage = "Error sending event, likely configuration";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, errorMessage };
  }
};

app.post("/event", async (req, res) => {
  console.log("\n(POST /event)");
  try {
    const requestBody: IProcessDodgeballServerEventApiParams = req.body;
    console.log("SEND SERVER EVENT", requestBody);
    const executionResult = await sendDodgeballServerEvent(requestBody);
    console.log("SEND SERVER EVENT RESPONSE", executionResult);
    return res.status(200).json(executionResult);
  } catch (error) {
    // Any error that gets here is unexpected
    // Most event errors will be handled by the sendDodgeballServerEvent method get a 200 response
    console.error("SEND SERVER EVENT ERROR", error);
    return res.status(500).json({ success: false, errorMessage: "Error at /event" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
