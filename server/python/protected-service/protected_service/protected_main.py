# Standard Library Imports
from typing import Any, Optional

# Utility Packages
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Dodgeball Imports
from dodgeball.api.dodgeball_config import DodgeballConfig
from dodgeball.api.dodgeball import Dodgeball
from dodgeball.interfaces.api_types import (
    DodgeballEvent,
    DodgeballVerification
)

# Convenience class to manage environment variables
from protected_service.simple_env import SimpleEnv


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExampleData(BaseModel):
    checkpointName: str
    payload: Optional[Any]
    sourceToken: Optional[str]
    sessionId: Optional[str]
    userId: Optional[str]
    verificationId: Optional[str]

class ExampleResponseData(BaseModel):
    verification: Optional[DodgeballVerification]
    message: Optional[str]


@app.post("/checkpoint", status_code=200)
async def executeCheckpoint(data: ExampleData, response: Response)->ExampleResponseData:
    try:
        base_url = SimpleEnv.get_value("DODGEBALL_API_URL")
        secret_key = SimpleEnv.get_value("DODGEBALL_PRIVATE_API_KEY")

        db_agent = Dodgeball(
            secret_key,
            DodgeballConfig(base_url))

        db_event = DodgeballEvent(
            type=data.checkpointName,
            ip="76.90.54.224",
            data=data.payload
        )

        checkpoint_response = await db_agent.checkpoint(
            db_event,
            data.sourceToken,
            data.sessionId,
            data.userId,
            data.verificationId)

        verification = checkpoint_response.verification
        if db_agent.is_allowed(checkpoint_response):
            return ExampleResponseData(
                verification=verification
            )
        elif db_agent.is_running(checkpoint_response):
            response.status_code = status.HTTP_202_ACCEPTED
            return ExampleResponseData(
                verification=verification
            )
        elif db_agent.is_denied(checkpoint_response):
            # Add in response code to forbid execution
            # (The checkpoint was DENIED)
            response.status_code=status.HTTP_403_FORBIDDEN

            # If the request is denied, you can return the verification to the frontend to display a reason message
            return ExampleResponseData(
                verification=verification)
        else:
            # Set status code to indicate an error
            response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

            # If the checkpoint failed, decide how you would like to proceed. You can return the error, choose to proceed, retry, or reject the request.
            return ExampleResponseData(
                message=str(checkpoint_response.errors))

    except Exception as exc:
        print("Invocation error, likely configuration", exc)

        # Set status code to indicate an error
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

        # If the checkpoint failed, decide how you would like to proceed. You can return the error, choose to proceed, retry, or reject the request.
        return ExampleResponseData(
            message = str(exc))

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=3020)
