package com.dodgeballhq.examples;

import com.dodgeballhq.protect.messages.CheckpointRequest;
import com.dodgeballhq.protect.messages.CheckpointResponse;
import com.dodgeballhq.protect.messages.DodgeballVerification;
import com.dodgeballhq.protect.messages.Event;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dodgeballhq.protect.Dodgeball;

@CrossOrigin(origins = "http://localhost:3021")
@RestController
class ProtectedServiceController {
    private String apiUrl;
    private String apiSecret;

    ProtectedServiceController() {
        Dotenv dotenv = Dotenv.configure()
                .directory(".")
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

        this.apiUrl = dotenv.get("DODGEBALL_API_URL");
        this.apiSecret = dotenv.get("DODGEBALL_PRIVATE_API_KEY");
    }


    // Aggregate root
    // tag::get-aggregate-root[]
    @PostMapping("/checkpoint")
    ResponseEntity<CheckpointResponse> invokeCheckpoint(@RequestBody ServiceRequest rawRequest) {
        try {
            Dodgeball dodgeball = Dodgeball.builder().
                    setApiKeys(this.apiSecret).
                    setDbUrl(this.apiUrl).
                    build();

            // Pass in an IP Address if this is known.
            // This allows us to pair the back end with the
            // IP Address at which the client has been seen.
            String ipAddress = "172.0.0.1";
            Event event = new Event(
                    ipAddress,
                    rawRequest.payload);

            CheckpointRequest dbRequest = new CheckpointRequest(
                    event,
                    rawRequest.checkpointName,
                    rawRequest.sourceToken,
                    rawRequest.sessionId,
                    rawRequest.userId,
                    null,
                    rawRequest.verificationId
            );

            var futureResponse = dodgeball.checkpoint(dbRequest);
            var response = futureResponse.join();
            if (Dodgeball.isAllowed(response)) {
                return new ResponseEntity<>(
                        response,
                        HttpStatus.OK);
            } else if (Dodgeball.isRunning(response)) {
                return new ResponseEntity<>(
                        response,
                        HttpStatus.ACCEPTED);
            } else if (Dodgeball.isDenied(response)) {
                return new ResponseEntity<>(
                        response,
                        HttpStatus.FORBIDDEN);
            } else {
                return new ResponseEntity<>(
                        response,
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception exception) {
            return new ResponseEntity<>(
                    null,
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}