# Dodgeball Training

## Overview

This repository contains a series of exercises and examples that are designed to help you learn how to use the Dodgeball Client and Server SDKs.

## Setup

1. Clone this repository (dodgeball-examples)
2. Setup the Client SDK
    - Move into the `training/web-next` directory
    - Copy the `.env.example` file to `.env` and add your configurations
    - Run `npm install` to install the dependencies
    - Run `npm run dev` to start the development server
    - Open the frontend in your browser by clicking on the link in the terminal
3. Setup the Server SDK
    - Move into the `training/node-ts` directory
    - Copy the `.env.example` file to `.env` and add your configurations
    - Run `npm install` to install the dependencies
    - Run `npm start` to start the development server (runs on port 3020 by default)

## Exercises

### Run a checkpoint

1. Open the frontend in your browser
2. Enter a checkpoint name for a checkpoint that you have setup in the Dodgeball Trust Console
3. Click Submit

### Run a checkpoint that doesn't exist

1. Open the frontend in your browser
2. Enter a checkpoint name for a checkpoint that you have not setup in the Dodgeball Trust Console
3. Click Submit

You should see the checkpoint run and return a result indicating that onCheckpointError was called.

### Cause an error (client side)

1. Go to your `.env` file in the `training/web-next` directory
2. Change the `NEXT_PUBLIC_DODGEBALL_PUBLIC_API_KEY` to a bad API key
3. Refresh the frontend in your browser

What do you see? Why did this happen?

### Error Handling on the client side

1. Find the line of code that prevents you from submitting when the API key is bad and comment it out
2. Refresh the frontend in your browser
3. Try submitting again

What do you see? Why did this happen?

1. Remove the try catch block that is catching the error now
2. Refresh the frontend in your browser
3. Try submitting again

What do you see? Why did this happen?

### Cause an error (server side)

1. Go to the `training/node-ts` directory
2. Give a bad API key in the `.env` file
3. Restart the server
4. Submit a valid checkpoint from the frontend

What do you see? Why did this happen?

5. Look at your server logs - do they provide any additional information about what happened?

### Error Handling on the server side

1. Find the try catch block in the server side code that catches the error you just caused
2. Remove the try catch block
3. Restart the server
4. Submit a valid checkpoint from the frontend

What do you see? Why did this happen?

5. Throw a test error at the beginning of the `/checkpoint` endpoint
6. Submit a valid checkpoint from the frontend
7. Clean up all the changes you made to get thigns working again and submit a valid checkpoint from the frontend

### Calling Checkpoints from the Server SDK

1. Go to the `training/node-ts` directory
2. Comment out the source token and provide undefined for a session id
3. Restart the server
4. Submit a valid checkpoint from the frontend

What do you see? Why did this happen?

5. Add one or both of the source token and session id back in and make sure they are not undefined
6. Submit a valid checkpoint from the frontend

What do you see? Why did this happen?

### Removing handling from the client side

1. Go to the `training/web-next` directory
2. In the `src/app/actions/dodgeball-actions.ts` file, comment out the `dodgeball.handleVerification` call
3. Submit a valid checkpoint from the frontend

What do you see? Why did this happen?
Did the checkpoint run?
How can you know?
When might this be useful?

### Handling user interactions on the client side

1. Leave the `dodgeball.handleVerification` call commented out in the `dodgeball-actions.ts` file
2. In the trust console, setup a checkpoint with a call to Twilio MFA
3. Click the submit button

What happens?
What does this mean for checkpoints that require user interaction?

4. Add back the `dodgeball.handleVerification` call
5. Click the submit button

What happens?
What does this mean for checkpoints that require user interaction?

6. Go back to the trust console and click "continue on failure" for the Twilio MFA step.
7. Click the submit button and fail the MFA.

What happens?

8. Add a decision after the MFA step in the trust console and approve/deny depending on whether they passed or failed the MFA.
9. Click the submit button and pass the MFA.

What happens?

10. Click the submit button and fail the MFA.

What happens?

11. Send an empty payload to the checkpoint (override this on the server)
12. Click the submit button

What happens?

13. Override the payload on the server to send an MFA to a different phone number
14. Click the submit button

What happens?

15. Comment out the part of actions.ts that uses the previousVerificationId if it is set to override the params.verificationId
16. Click the submit button and complete the MFA

What happens?

17. In the same vein, comment out the part of the server side processing of a checkpoint that sends the verificationId to the client
18. Click the submit button and complete the MFA

What happens?

19. Add the verificationId back in and click the submit button and complete the MFA

What happens?
