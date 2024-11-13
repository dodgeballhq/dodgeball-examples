import { CheckpointOrEventForm } from "./components/checkpoint-or-event-form";
import { MessagesContainer } from "./components/messages-container";
import { PageHeader } from "./components/page-header";
import { StateViewer } from "./components/state-viewer";
import { SubmitButton } from "./components/submit-button";
import { UserSelector } from "./components/user-selector";

export default function Home() {
  return (
    <div>
      <PageHeader apiUrl={process.env.NEXT_PUBLIC_DODGEBALL_API_URL ?? "Default"} />
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
