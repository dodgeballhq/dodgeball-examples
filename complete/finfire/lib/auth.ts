// lib/auth.ts
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { nanoid } from "nanoid";
import { serverEnv } from "./environment";
import { ApiRoutes } from "./navigation";

interface IJwtPayload {
  userId: string;
  sessionId: string;
}
const isJwtPayload = (payload: any): payload is IJwtPayload => {
  return typeof payload === "object" && payload !== null && "userId" in payload && "sessionId" in payload;
};

const secret = new TextEncoder().encode(serverEnv.authSecret);
if (!secret) {
  throw new Error("Auth secret is not set");
}

/**
 * Sign a new JWT token.
 *
 * Optionally:
 * - pass a userId
 */
export async function signJwt(userId: string, sessionId?: string) {
  // Generate a random session ID if not provided
  sessionId = sessionId ?? `sess-${nanoid()}`;

  // Add whatever claims you like here:
  return await new SignJWT({ userId, sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);
}

export async function verifyJwt(token: string): Promise<IJwtPayload> {
  // If invalid or expired, jwtVerify will throw
  const { payload } = await jwtVerify(token, secret);
  // payload.userId, payload.sessionId, ...
  if (isJwtPayload(payload)) {
    return payload;
  }
  throw new Error("Invalid JWT payload");
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}

interface IAuthenticatedFetchOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  route: ApiRoutes;
  options?: RequestInit;
}
/**
 * Authorization is handled by the server.
 * This function is used to fetch data from the server.
 */
export const authenticatedFetch = async ({ method, route, options = {} }: IAuthenticatedFetchOptions) => {
  // Default content type to json
  const defaultHeaders = { "Content-Type": "application/json" };
  return fetch(route, {
    method,
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
};

export const logout = async () => {
  await authenticatedFetch({ route: ApiRoutes.LOGOUT, method: "POST" });
};

export const login = async () => {
  await authenticatedFetch({ route: ApiRoutes.LOGIN, method: "POST" });
};
