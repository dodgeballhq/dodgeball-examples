import * as dotenv from 'dotenv';
dotenv.config()

import { Dodgeball } from '@dodgeball/trust-sdk-server';
import express from 'express';
import cors from 'cors';

const APP_PORT = 3020;

const app = express();
app.use(express.json());
app.use(cors());

app.options('*', cors());

// Initialize the SDK with your secret API key.
const dodgeball = new Dodgeball(process.env.DODGEBALL_PRIVATE_API_KEY, {
  apiUrl: process.env.DODGEBALL_API_URL ?? null
});

// Here's a simple utility method for grabbing the originating IP address from the request.
const getIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",").shift() ||
    req.socket?.remoteAddress
  );
};

app.post('/checkpoint', async (req, res) => {
  console.log('CALL CHECKPOINT', req.body);
  // In moments of risk, call a checkpoint within Dodgeball to verify the request is allowed to proceed
  const checkpointResponse = await dodgeball.checkpoint({
    checkpointName: req.body.checkpointName,
    event: {
      ip: getIp(req),
      data: {
        ...req.body.payload
      }
    },
    sourceToken: req.body.sourceToken, // Obtained from the Dodgeball Client SDK, represents the device making the request
    sessionId: req.body.sessionId,
    userId: req.body.userId,
    useVerificationId: req.body.verificationId
  });

  if (dodgeball.isAllowed(checkpointResponse)) {
    // Proceed with placing the order
    return res.status(200).json({
      verification: checkpointResponse.verification
    });
  } else if (dodgeball.isRunning(checkpointResponse)) {
    // If the outcome is pending, send the verification to the frontend to do additional checks (such as MFA, KYC)
    return res.status(202).json({
      verification: checkpointResponse.verification
    });
  } else if (dodgeball.isDenied(checkpointResponse)) {
    // If the request is denied, you can return the verification to the frontend to display a reason message
    return res.status(403).json({
      verification: checkpointResponse.verification
    });
  } else {
    // If the checkpoint failed, decide how you would like to proceed. You can return the error, choose to proceed, retry, or reject the request.
    return res.status(500).json({
      message: checkpointResponse.errors
    });
  }
});

app.listen(APP_PORT, () => {
  console.log(`Listening on port ${APP_PORT}`);
});