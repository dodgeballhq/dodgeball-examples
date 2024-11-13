import { Dodgeball, DodgeballApiVersion } from "@dodgeball/trust-sdk-client";
import { CheckpointOrEventForm } from "./components/checkpoint-or-event-form";
import { MessagesContainer } from "./components/messages-container";
import { PageHeader } from "./components/page-header";
import { StateViewer } from "./components/state-viewer";
import { SubmitButton } from "./components/submit-button";
import { UserSelector } from "./components/user-selector";
import dodgeballGlobalState from "./helpers/state";

export default function Home() {
  const dodgeballPublicApiKey = process.env.NEXT_PUBLIC_DODGEBALL_PUBLIC_API_KEY ?? "UNSET_PUBLIC_API_KEY";
  const dodgeballApiUrl = process.env.NEXT_PUBLIC_DODGEBALL_API_URL;

  const dodgeball = new Dodgeball(dodgeballPublicApiKey, {
    apiUrl: dodgeballApiUrl,
    apiVersion: DodgeballApiVersion.v1,
  });

  dodgeballGlobalState.setDodgeball(dodgeball);
  return (
    <div>
      <PageHeader apiUrl={dodgeballApiUrl ?? "Default"} />
      <div className="container">
        <div className="left-column">
        <CheckpointOrEventForm />
        </div>
        <div className="right-column">
          <UserSelector />
        </div>
    </div>
    <div className="container">
      <SubmitButton />
    </div>
    <div className="container">
      <MessagesContainer />
    </div>
    <div className="container">
      <StateViewer state />
    </div>
    </div>
  );
}
