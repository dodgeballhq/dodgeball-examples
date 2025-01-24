import { z } from "zod";

const clientSchema = z.object({
  dodgeball: z.object({
    publicApiKey: z.string().default("UNSET"),
  }),
});

const sharedSchema = z.object({
  flags: z.object({
    isDemoMode: z.boolean().default(false),
  }),
  dodgeball: z.object({
    apiUrl: z.string().default("https://api.dodgeballhq.com"),
  }),
});

const serverSchema = z.object({
  authSecret: z.string().default("UNSET"),
  dodgeball: z.object({
    privateApiKey: z.string().default("UNSET"),
  }),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
export type SharedEnv = z.infer<typeof sharedSchema>;

// Use process.env for server vars
const getServerEnv = () => {
  const serverEnv: ServerEnv = serverSchema.parse({
    authSecret: process.env.AUTH_SECRET,
    dodgeball: {
      privateApiKey: process.env.DODGEBALL_PRIVATE_API_KEY,
    },
  });
  return serverEnv;
};

export const serverEnv = getServerEnv();

const getSharedEnv = () => {
  const sharedEnv: SharedEnv = sharedSchema.parse({
    flags: {
      isDemoMode: process.env.NEXT_PUBLIC_IS_DEMO_MODE === "true",
    },
    dodgeball: {
      apiUrl: process.env.NEXT_PUBLIC_DODGEBALL_API_URL,
    },
  });
  return sharedEnv;
};

export const sharedEnv = getSharedEnv();

// Use public vars for client
const getClientEnv = () => {
  const clientEnv: ClientEnv = clientSchema.parse({
    dodgeball: {
      publicApiKey: process.env.NEXT_PUBLIC_DODGEBALL_PUBLIC_API_KEY,
    },
  });
  return clientEnv;
};

export const clientEnv = getClientEnv();
