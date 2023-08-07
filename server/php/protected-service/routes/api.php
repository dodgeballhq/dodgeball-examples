<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

// Initialize the SDK with your secret API key.
use Dodgeball\DodgeballSdkServer\Dodgeball;

Route::post('/checkpoint', function(Request $request) {
  $dodgeball = new Dodgeball(env('DODGEBALL_PRIVATE_API_KEY'), [
    'apiUrl' => env('DODGEBALL_API_URL', null),
  ]);

  // In moments of risk, call a checkpoint within Dodgeball to verify the request is allowed to proceed
  Log::info('Dodgeball Initialized');
  Log::info($request->input('payload'));
  $checkpointResponse = $dodgeball->checkpoint([
    'checkpointName' => $request->input('checkpointName'),
    'event' => [
      'ip' => $request->ip(),
      'data' => $request->input('payload'),
    ],
    'sourceToken' => $request->input('sourceToken'),
    'sessionId' => $request->input('sessionId'),
    'userId' => $request->input('userId'),
    'useVerificationId' => $request->input('verificationId'),
    'options' => [
      'sync' => false,
      'timeout' => 1400
    ]
  ]);

  Log::info('Checkpoint Response: ' . json_encode($checkpointResponse));

  if ($checkpointResponse->isAllowed()) {
    // Proceed with the attempted action...
    // $placedOrder = app('database')->createOrder($order);
    Log::info('Return allowed response');
    return response()->json([
      'verification' => $checkpointResponse->verification,
    ]);
  } else if ($checkpointResponse->isRunning()) {
    Log::info('Return running response');
    // If the outcome is pending, send the verification to the frontend to do additional checks (such as MFA, KYC)
    return response()->json([
      'verification' => $checkpointResponse->verification,
    ], 202);
  } else if ($checkpointResponse->isDenied()) {
    Log::info('Return denied response');
    // If the request is denied, you can return the verification to the frontend to display a reason message
    return response()->json([
      'verification' => $checkpointResponse->verification,
    ], 200);
  } else {
    Log::info('Return failed response');
    // If the checkpoint failed, decide how you would like to proceed. You can return the error, choose to proceed, retry, or reject the request.
    return response()->json([
      'message' => $checkpointResponse->errors,
    ], 500);
  }
});