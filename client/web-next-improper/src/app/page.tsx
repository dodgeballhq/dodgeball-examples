import { Dodgeball, DodgeballApiVersion } from "@dodgeball/trust-sdk-client";

export default function Home() {
  const dodgeballPublicApiKey = process.env.NEXT_PUBLIC_DODGEBALL_PUBLIC_API_KEY ?? "UNSET_PUBLIC_API_KEY";
  const dodgeballApiUrl = process.env.NEXT_PUBLIC_DODGEBALL_API_URL;

  console.log("Home running on the client side: ", dodgeballPublicApiKey, dodgeballApiUrl);
  const dodgeball = new Dodgeball(dodgeballPublicApiKey, {
    apiUrl: dodgeballApiUrl,
    apiVersion: DodgeballApiVersion.v1,
  });
  if (dodgeball) {
    console.log("Dodgeball initialized");
  } else {
    console.log("Dodgeball not initialized");
  }
  return <div>Hello From Page.tsx (SSR)</div>;
}