import { useDodgeball, DodgeballApiVersion } from "@dodgeball/trust-sdk-client";
import { useState, useEffect } from "react";
import axios from "axios";
// import JSONInput from "react-json-editor-ajrm";
// // import locale from "react-json-editor-ajrm/locale/en";
// import { dark_vscode_tribute, localeEn } from "./jsonEditor";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

const DODGEBALL_PUBLIC_API_KEY = "4ce402ac5c7111ec"; // Fill in with your public API key
const DODGEBALL_API_URL = "http://localhost:3001"; // Fill in with your API URL

interface IUser {
  id: string;
  sessions: string[];
}

export default function App() {
  const dodgeball = useDodgeball(DODGEBALL_PUBLIC_API_KEY, {
    apiUrl: DODGEBALL_API_URL,
    apiVersion: DodgeballApiVersion.v1,
  }); // Once initialized, you can omit the public API key

  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<any>(null);
  const [userList, setUserList] = useState<IUser[]>([]);
  const [checkpointName, setCheckpointName] = useState<string>("");
  const [payloadValue, setPayloadValue] = useState<string>("{}");
  const [anonymousSessions, setAnonymousSessions] = useState<string[]>([]);

  const [isSubmittingCheckpoint, setIsSubmittingCheckpoint] = useState(false);
  const [isCheckpointSubmitted, setIsCheckpointSubmitted] = useState(false);
  const [status, setStatus] = useState<
    "VERIFIED" | "APPROVED" | "DENIED" | "ERROR" | null
  >(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setIsSubmittingCheckpoint(false);
  }, [isCheckpointSubmitted]);

  useEffect(() => {
    console.log("DODGEBALL TRACK CALLED", currentUser?.id, currentSessionId);
    /* 
      When you know the ID of the currently logged-in user, 
      pass it along with a session ID to dodgeball.track():
    */
    dodgeball.track(currentSessionId, currentUser?.id);
  }, [currentUser?.id, currentSessionId]);

  const submitCheckpoint = async (
    payload: any,
    previousVerificationId: string | null = null
  ) => {
    const sourceToken = await dodgeball.getSourceToken();

    const endpointResponse = await axios.post(
      "http://localhost:3020/checkpoint",
      {
        payload: JSON.parse(payloadValue),
        sessionId: currentSessionId,
        userId: currentUser?.id,
        checkpointName: checkpointName,
      },
      {
        headers: {
          "x-dodgeball-source-token": sourceToken, // Pass the source token to your API
          "x-dodgeball-verification-id": previousVerificationId, // If a previous verification was performed, pass it along to your API
        },
      }
    );

    dodgeball.handleVerification(endpointResponse.data.verification, {
      onVerified: async (verification) => {
        // If an additional check was performed and the request is approved, simply pass the verification ID in to your API
        setStatus("VERIFIED");
        await submitCheckpoint(payload, verification.id);
      },
      onApproved: async () => {
        // If no additional check was required, update the view to show that the order was placed
        setIsCheckpointSubmitted(true);
        setStatus("APPROVED");
      },
      onDenied: async (verification) => {
        // If the action was denied, update the view to show the rejection
        setStatus("DENIED");
      },
      onError: async (error) => {
        setStatus("ERROR");
        // If there was an error performing the verification, display it
        setError(error); // Usage Note: If the user cancels the verification, error.errorType = "CANCELLED"
        setIsSubmittingCheckpoint(false);
      },
    });
  };

  const onCallCheckpointClick = async () => {
    setIsSubmittingCheckpoint(true);

    await submitCheckpoint({});
  };

  const selectSessionId = (
    sessionId: string | null,
    forUser: IUser | null = null
  ) => {
    console.log("SELECT SESSION ID CALLED", sessionId, forUser);
    if (!sessionId) {
      sessionId = uuidv4();
    }

    if (!forUser) {
      forUser = currentUser;
    }

    if (forUser) {
      const foundSession = forUser.sessions.find(
        (session) => session === sessionId
      );

      console.log("FOUND SESSION", foundSession);

      if (!foundSession) {
        console.log("ADD SESSION", sessionId, [...forUser.sessions, sessionId]);
        const updatedUser = {
          ...forUser,
          sessions: [...forUser.sessions, sessionId],
        };

        setCurrentUser(updatedUser);

        if (userList.find((user) => user.id === forUser?.id)) {
          setUserList(
            userList.map((user) => {
              if (user.id === forUser?.id) {
                return updatedUser;
              }

              return user;
            })
          );
        } else {
          setUserList([updatedUser, ...userList]);
        }
      }

      setCurrentSessionId(sessionId);
    } else {
      setCurrentSessionId(sessionId);
    }
  };

  const selectUser = (
    userId: string | null,
    sessionId: string | null = null
  ) => {
    console.log("SELECT USER CALLEd", userId, sessionId);
    if (!userId) {
      const newUser = {
        id: uuidv4(),
        sessions: sessionId ? [sessionId] : [],
      };

      setCurrentUser(newUser);
      setUserList([newUser, ...userList]);
      selectSessionId(sessionId, newUser);
    } else {
      // Find the user in the list
      const foundUser = userList.find((user) => user.id === userId);

      if (!foundUser) {
        const newUser = {
          id: userId,
          sessions: sessionId ? [sessionId] : [],
        };

        setCurrentUser(newUser);
        setUserList([newUser, ...userList]);
        selectSessionId(sessionId, newUser);
      } else {
        setCurrentUser(foundUser);
        selectSessionId(sessionId, foundUser);
      }
    }
  };

  const selectAnonymousUser = () => {
    setCurrentUser(null);
    setCurrentSessionId(null);
  };

  const selectAnonymousSession = (sessionId: string | null = null) => {
    if (!sessionId) {
      sessionId = uuidv4();
      setAnonymousSessions([sessionId, ...anonymousSessions]);
    }

    setCurrentSessionId(sessionId);
  };

  const formatPayload = () => {
    let formattedPayload = payloadValue;

    try {
      let parsedPayload = JSON.parse(payloadValue);
      formattedPayload = JSON.stringify(parsedPayload, null, 2);
    } catch (e) {
      // console.log(e);
    }

    setPayloadValue(formattedPayload);
  };

  return (
    <div>
      <h2>Call a Checkpoint</h2>
      <p>
        This example is built using the Dodgeball Client SDK. You can use it to
        call checkpoints on your Dodgeball account and pass in arbitrary event
        data. Use it to experiment!
      </p>
      <div className="container">
        <div className="left-column">
          <div className="field-group">
            <div>
              <label htmlFor="checkpoint-name">Checkpoint Name</label>
            </div>
            <input
              className="field-text-input"
              name="checkpoint-name"
              type="text"
              placeholder="e.g. PAYMENT"
              value={checkpointName}
              onChange={(e) => setCheckpointName(e.target.value)}
            />
          </div>
          <div className="field-group">
            <div>
              <label htmlFor="checkpoint-payload">Checkpoint Payload</label>
            </div>
            {/* <JSONInput
              id="checkpoint-payload"
              placeholder={{}}
              colors={dark_vscode_tribute}
              locale={localeEn}
              height="300px"
            /> */}
            <textarea
              className="payload-input"
              name="checkpoint-payload"
              value={payloadValue}
              onChange={(e) => setPayloadValue(e.target.value)}
              onBlur={formatPayload}
              rows={4}
              cols={20}
            />
          </div>
        </div>
        <div className="right-column">
          <div>
            <div>Choose a user ID</div>
            {userList.map((user) => {
              const isSelected = user.id === currentUser?.id;

              return (
                <div>
                  <label>
                    <input
                      type="radio"
                      value={user.id}
                      key={user.id}
                      checked={isSelected}
                      onChange={() =>
                        selectUser(
                          user.id,
                          user.sessions ? user.sessions[0] : null
                        )
                      }
                    />
                    {user.id}
                  </label>
                  {isSelected && (
                    <div className="user-session-list">
                      <div>Choose a Session ID</div>
                      <div>
                        {user.sessions.map((sessionId) => {
                          const isSessionSelected =
                            sessionId === currentSessionId;

                          return (
                            <div>
                              <label>
                                <input
                                  type="radio"
                                  value={sessionId}
                                  key={sessionId}
                                  checked={isSessionSelected}
                                  onChange={() =>
                                    selectUser(user.id, sessionId)
                                  }
                                />
                                {sessionId}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                      <div>
                        <button onClick={() => selectUser(user.id, null)}>
                          New Session
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div>
              <label>
                <input
                  type="radio"
                  checked={currentUser === null}
                  value={"Anonymous"}
                  onChange={() => selectAnonymousUser()}
                />
                {"Anonymous (No User ID)"}
              </label>
              {currentUser === null && (
                <div className="user-session-list">
                  <div>Choose a Session ID</div>
                  <div>
                    {anonymousSessions.map((sessionId) => {
                      const isSessionSelected = sessionId === currentSessionId;

                      return (
                        <div>
                          <label>
                            <input
                              type="radio"
                              value={sessionId}
                              key={sessionId}
                              checked={isSessionSelected}
                              onChange={() => selectAnonymousSession(sessionId)}
                            />
                            {sessionId}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <button onClick={() => selectAnonymousSession(null)}>
                      New Anonymous Session
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <button onClick={() => selectUser(null)}>New User</button>
            </div>
          </div>
        </div>
      </div>
      <div className="submit-button-container">
        {status && (
          <div className="checkpoint-status">
            Latest Checkpoint Response: {status}
          </div>
        )}
        <button
          onClick={onCallCheckpointClick}
          disabled={isSubmittingCheckpoint}
        >
          {isSubmittingCheckpoint ? "Submitting..." : "Call Checkpoint"}
        </button>
      </div>
    </div>
  );
}
