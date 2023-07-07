import { useDodgeball, DodgeballApiVersion } from "@dodgeball/trust-sdk-client";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

interface IUser {
  id: string;
  sessions: string[];
}

export default function App() {
  const dodgeball = useDodgeball(
    process.env.REACT_APP_DODGEBALL_PUBLIC_API_KEY,
    {
      apiUrl: process.env.REACT_APP_DODGEBALL_API_URL,
      apiVersion: DodgeballApiVersion.v1,
    }
  ); // Once initialized, you can omit the public API key

  const [selectedUserType, setSelectedUserType] = useState<
    "SELECT" | "SPECIFIC" | "ANONYMOUS"
  >("SELECT");
  const [selectedSessionType, setSelectedSessionType] = useState<
    "SELECT" | "SPECIFIC"
  >("SELECT");
  const [specificUserId, setSpecificUserId] = useState<string>("");
  const [specificSessionId, setSpecificSessionId] = useState<string>("");

  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<any>(null);
  const [userList, setUserList] = useState<IUser[]>([]);
  const [checkpointName, setCheckpointName] = useState<string>("");
  const [payloadValue, setPayloadValue] = useState<string>(
    JSON.stringify(JSON.parse('{"example": "payload"}'), null, 2)
  );
  const [anonymousSessions, setAnonymousSessions] = useState<string[]>([]);
  const [specificSessions, setSpecificSessions] = useState<string[]>([]);

  const [isSubmittingCheckpoint, setIsSubmittingCheckpoint] = useState(false);
  const [isCheckpointSubmitted, setIsCheckpointSubmitted] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setIsSubmittingCheckpoint(false);
  }, [isCheckpointSubmitted]);

  useEffect(() => {
    /* 
      When you know the ID of the currently logged-in user, 
      pass it along with a session ID to dodgeball.track():
    */
    dodgeball.track(currentSessionId, currentUser?.id);
  }, [currentUser?.id, currentSessionId]);

  const hasPayloadError = useMemo(() => {
    try {
      JSON.stringify(JSON.parse(payloadValue), null, 2);
      return false;
    } catch (e) {
      return true;
    }
  }, [payloadValue]);

  const canSubmitCheckpoint = useMemo(() => {
    return (
      !hasPayloadError &&
      checkpointName?.length >= 3 &&
      payloadValue?.length > 0 &&
      currentSessionId
    );
  }, [checkpointName, payloadValue, hasPayloadError, currentSessionId]);

  const submitCheckpoint = async (
    userId: string | null,
    sessionId: string,
    previousVerificationId: string | null = null
  ) => {
    setError(null);
    const sourceToken = await dodgeball.getSourceToken();
    try {
      const endpointResponse = await axios.post(
        "http://localhost:3020/checkpoint",
        {
          payload: JSON.parse(payloadValue),
          sessionId: sessionId,
          userId: userId,
          checkpointName: checkpointName,
          sourceToken: sourceToken,
          verificationId: previousVerificationId,
        }
      );
      console.log("ENDPOINT RESPONSE", endpointResponse);

      dodgeball.handleVerification(endpointResponse.data.verification, {
        onVerified: async (verification) => {
          // If an additional check was performed and the request is approved, simply pass the verification ID in to your API
          setStatus("VERIFIED");
          await submitCheckpoint(userId, sessionId, verification.id);
        },
        onApproved: async (verification) => {
          // If no additional check was required, update the view to show that the order was placed
          if (verification?.stepData?.customMessage) {
            setStatus(`APPROVED:\n\n${verification.stepData.customMessage}`);
          } else {
            setStatus("APPROVED");
          }
          setIsSubmittingCheckpoint(false);
        },
        onDenied: async (verification) => {
          // If the action was denied, update the view to show the rejection
          if (verification?.stepData?.customMessage) {
            setStatus(`DENIED:\n\n${verification.stepData.customMessage}`);
          } else {
            setStatus("DENIED");
          }
          setIsSubmittingCheckpoint(false);
        },
        onError: async (error) => {
          setStatus("ERROR");
          // If there was an error performing the verification, display it
          if (error?.hasOwnProperty("details")) {
            setError(error.details); // Usage Note: If the user cancels the verification, error.errorType = "CANCELLED"
          } else {
            setError(error);
          }
          setIsSubmittingCheckpoint(false);
        },
      });
    } catch (error: any) {
      setError(error?.message);
      setIsSubmittingCheckpoint(false);
    }
  };

  const onCallCheckpointClick = async () => {
    let userId = currentUser?.id ?? null;
    let sessionId = currentSessionId;

    if (selectedUserType === "SPECIFIC") {
      userId = specificUserId;
    }

    if (selectedSessionType === "SPECIFIC") {
      sessionId = specificSessionId;
    }

    setIsSubmittingCheckpoint(true);
    await submitCheckpoint(userId, sessionId);
  };

  const selectSessionId = (
    sessionId: string | null,
    forUser: IUser | null = null
  ) => {
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

      if (!foundSession) {
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
    setSelectedUserType("SELECT");
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

  const selectSession = (sessionId: string | null = null) => {
    setSelectedSessionType("SELECT");

    if (!sessionId) {
      sessionId = uuidv4();
      setSpecificSessions([sessionId, ...specificSessions]);
    }
    setCurrentSessionId(sessionId);
  };

  const selectSpecificUser = () => {
    setSelectedUserType("SPECIFIC");
    // setCurrentSessionId("SPECIFIC");
  };

  const selectSpecificSession = () => {
    setSelectedSessionType("SPECIFIC");
  };

  const selectAnonymousUser = () => {
    setSelectedUserType("ANONYMOUS");
    setCurrentUser(null);
    setCurrentSessionId(
      anonymousSessions.length > 0 ? anonymousSessions[0] : null
    );
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
    } catch (e) {}

    setPayloadValue(formattedPayload);
  };

  return (
    <div>
      <div className="header-container">
        <h2>Call a Checkpoint</h2>
        <p>
          This example is built using the Dodgeball Client SDK. You can use it
          to call checkpoints on your Dodgeball account and pass in arbitrary
          event data. Use it to experiment!
        </p>
      </div>
      <div className="container">
        <div className="left-column">
          <div className="field-group">
            <div className="field-label">
              <label htmlFor="checkpoint-name">Checkpoint Name</label>
            </div>
            <input
              className="field-checkpoint-name-input"
              name="checkpoint-name"
              type="text"
              placeholder="e.g. PAYMENT"
              value={checkpointName}
              onChange={(e) =>
                setCheckpointName(
                  e.target.value?.toUpperCase()?.replace(/ /g, "_")
                )
              }
            />
          </div>
          <div className="field-group">
            <div className="field-label">
              <label htmlFor="checkpoint-payload">Checkpoint Payload</label>
            </div>
            <textarea
              className="payload-input"
              name="checkpoint-payload"
              value={payloadValue}
              onChange={(e) => setPayloadValue(e.target.value)}
              onBlur={formatPayload}
              rows={4}
              cols={20}
            />
            {hasPayloadError && (
              <div className="error-message">
                Make sure you enter valid JSON.
              </div>
            )}
          </div>
        </div>
        <div className="right-column">
          <div>
            <div className="user-selector-title">
              Select a User and Session Option:
            </div>
            <div className="user-item-container">
              <label>
                <div className="field-label">Use a Custom User:</div>
                <input
                  className="radio-input"
                  type="radio"
                  checked={selectedUserType === "SPECIFIC"}
                  value={"SPECIFIC"}
                  onChange={() => selectSpecificUser()}
                />
                <input
                  className="field-text-input"
                  type="text"
                  value={specificUserId}
                  placeholder="Enter a specific User ID"
                  onChange={(ev) => setSpecificUserId(ev.target.value)}
                />
              </label>
              {selectedUserType === "SPECIFIC" && (
                <div className="user-session-list">
                  <label>
                    <div className="field-label">Choose a Session ID:</div>
                    <input
                      className="radio-input"
                      type="radio"
                      checked={selectedSessionType === "SPECIFIC"}
                      value={"SPECIFIC"}
                      onChange={() => selectSpecificSession()}
                    />
                    <input
                      className="field-text-input"
                      type="text"
                      placeholder="Enter a Specific Session ID"
                      value={specificSessionId}
                      onChange={(ev) => setSpecificSessionId(ev.target.value)}
                    />
                  </label>
                  <div>
                    {specificSessions.map((sessionId) => {
                      const isSessionSelected =
                        selectedSessionType === "SELECT" &&
                        sessionId === currentSessionId;

                      return (
                        <div>
                          <label>
                            <input
                              className="radio-input"
                              type="radio"
                              value={sessionId}
                              key={sessionId}
                              checked={isSessionSelected}
                              onChange={() => selectSession(sessionId)}
                            />
                            {sessionId}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  <div className="add-button-container">
                    <button onClick={() => selectSession(null)}>
                      New Session
                    </button>
                  </div>
                </div>
              )}
            </div>
            {userList.length > 0 && (
              <div className="user-item-container">
                <div className="field-label">Choose a User ID:</div>
                {userList.map((user) => {
                  const isSelected =
                    selectedUserType === "SELECT" &&
                    user.id === currentUser?.id;

                  return (
                    <div className="user-item">
                      <label>
                        <input
                          className="radio-input"
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
                          <div className="session-selector-title">
                            Choose a Session ID
                          </div>
                          <div>
                            {user.sessions.map((sessionId) => {
                              const isSessionSelected =
                                sessionId === currentSessionId;

                              return (
                                <div>
                                  <label>
                                    <input
                                      className="radio-input"
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
                          <div className="add-button-container">
                            <button onClick={() => selectUser(user.id, null)}>
                              New Session
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="user-item-container">
              <label>
                <input
                  className="radio-input"
                  type="radio"
                  checked={selectedUserType === "ANONYMOUS"}
                  value={"ANONYMOUS"}
                  onChange={() => selectAnonymousUser()}
                />
                {"Anonymous (No User ID)"}
              </label>
              {currentUser === null && (
                <div className="user-session-list">
                  <div className="session-selector-title">
                    Choose a Session ID
                  </div>
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
                  <div className="add-button-container">
                    <button onClick={() => selectAnonymousSession(null)}>
                      New Anonymous Session
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="add-button-container">
              <button onClick={() => selectUser(null)}>New User</button>
            </div>
          </div>
        </div>
      </div>
      <div className="submit-button-container">
        <button
          onClick={onCallCheckpointClick}
          disabled={isSubmittingCheckpoint || !canSubmitCheckpoint}
        >
          {isSubmittingCheckpoint ? "Submitting..." : "Call Checkpoint"}
        </button>
        {status && (
          <div className="checkpoint-status">
            Latest Checkpoint Response:
            <pre className="checkpoint-response-box">{status}</pre>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}
