import { ClientComponentExample } from "./components/clientComponentExample";

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <div>Hello From Page.tsx (SSR)</div>
      <ClientComponentExample title="Client Component Example #1" />
      <ClientComponentExample title="Client Component Example #2" />
      <ClientComponentExample title="Client Component Example #3" showDebugInfo={false} />
    </div>
  );
}
