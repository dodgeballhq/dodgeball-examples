package main

import (
	"fmt"
	"github.com/dodgeballhq/dodgeball-trust-sdk-go"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/markphelps/optional"
	"log"
	"net/http"
	"os"
	"strconv"
)

type CheckpointRequest struct {
	CheckpointName string                 `json:"checkpointName"`
	Payload        map[string]interface{} `json:"payload"`
	SourceToken    string                 `json:"sourceToken"`
	SessionId      string                 `json:"sessionId"`
	UserId         string                 `json:"userId"`
	VerificationId string                 `json:"verificationId"`
}

type CheckpointResponse struct {
	Success                bool                                     `json:"success"`
	Message                []dodgeball.CheckpointResponseError      `json:"message"`
	SampleConfirmationCode optional.String                          `json:"SampleConfirmationCode"`
	RequiresResubmit       optional.Bool                            `json:"RequiresResubmit"`
	Verification           dodgeball.CheckpointResponseVerification `json:"verification"`
}

func processOptions(optionsContext *gin.Context) {
	optionsContext.JSON(http.StatusAccepted, map[string]interface{}{})
}

func executeTracking(
	dodgeballClient *dodgeball.Dodgeball,
	checkpointName string,
	payload map[string]interface{},
	sourceToken string,
	sessionId string,
	userId string) {

	trackOptions := dodgeball.TrackOptions{
		Event: dodgeball.TrackEvent{
			Type: "Event_" + checkpointName,
			Data: payload,
		},
		SourceToken: sourceToken,
		SessionID:   sessionId,
		UserID:      userId,
	}

	err := dodgeballClient.Event(trackOptions)
	if err != nil {
		fmt.Print("Error tracking")
	}
}

func processCheckpoint(requestContext *gin.Context) {
	var postRequest CheckpointRequest

	// Call BindJSON to bind the received JSON to
	// newAlbum.
	if err := requestContext.BindJSON(&postRequest); err != nil {
		requestContext.JSON(http.StatusInternalServerError,
			CheckpointResponse{Success: false})

		return
	}

	checkpointOptions := dodgeball.CheckpointResponseOptions{}
	timeoutString := os.Getenv("CHECKPOINT_TIMEOUT")
	if timeoutString != "" {
		timeout, err := strconv.Atoi(timeoutString)
		if err == nil {
			checkpointOptions.Timeout = timeout
		}
	}

	var checkpointRequest = dodgeball.CheckpointRequest{
		CheckpointName: postRequest.CheckpointName,
		Event: dodgeball.CheckpointEvent{
			IP:   requestContext.ClientIP(),
			Data: postRequest.Payload,
		},
		SourceToken:       postRequest.SourceToken,
		UserID:            postRequest.UserId,
		SessionID:         postRequest.SessionId,
		UseVerificationID: postRequest.VerificationId,
		Options:           checkpointOptions,
	}

	var dbConfig = dodgeball.NewConfig()
	dbConfig.APIURL = os.Getenv("DODGEBALL_API_URL")

	var dodgeballClient = dodgeball.New(
		os.Getenv("DODGEBALL_PRIVATE_API_KEY"),
		dbConfig)

	executeTracking(
		dodgeballClient,
		postRequest.CheckpointName,
		postRequest.Payload,
		postRequest.SourceToken,
		postRequest.SessionId,
		postRequest.UserId)

	checkpointResponse, err := dodgeballClient.Checkpoint(checkpointRequest)
	if err != nil {
		requestContext.JSON(http.StatusInternalServerError,
			CheckpointResponse{Success: false})

		return
	}

	if checkpointResponse.IsAllowed() {
		requestContext.JSON(
			http.StatusOK,
			CheckpointResponse{
				Success:      true,
				Verification: checkpointResponse.Verification,
			},
		)
	} else if checkpointResponse.IsRunning() {
		requestContext.JSON(
			http.StatusAccepted,
			CheckpointResponse{
				Success:      true,
				Verification: checkpointResponse.Verification,
			},
		)
	} else if checkpointResponse.IsDenied() {
		requestContext.JSON(
			http.StatusForbidden,
			CheckpointResponse{
				Success:      true,
				Verification: checkpointResponse.Verification,
			},
		)
	} else {
		requestContext.JSON(
			http.StatusInternalServerError,
			CheckpointResponse{
				Success:      false,
				Message:      checkpointResponse.Errors,
				Verification: checkpointResponse.Verification,
			},
		)
	}
}

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Some error occured. Err: %s", err)
	}

	router := gin.Default()
	router.Use(cors.Default())
	router.POST("/checkpoint", processCheckpoint)
	router.OPTIONS("/checkpoint", processOptions)

	router.Run("localhost:3020")
}
