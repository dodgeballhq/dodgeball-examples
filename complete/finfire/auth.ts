"use server";

import bcrypt from "bcryptjs";
import * as jose from "jose";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { UsersService } from "./lib/api/users/service";
import { UserResponse } from "./lib/api/users/types";
import { serverEnv } from "./lib/environment";
import { prisma } from "./lib/prisma";
// This simple authentication is meant to be easy to use for testing purposes
// It is not meant to be used in production

export interface Session {
  id: string;
  user: UserResponse;
}

// Convert secret to Uint8Array for jose
const secret = new TextEncoder().encode(serverEnv.authSecret);

export const getAuthToken = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Use a generic error message for security
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isPasswordValid) {
    // Use same generic error message
    throw new Error("Invalid credentials");
  }

  const userResponse = UsersService.convertUserToUserResponse(user);
  const session: Session = {
    id: nanoid(),
    user: userResponse,
  };

  // Create JWT using jose
  const token = await new jose.SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);
  return token;
};

export const getRefreshedAuthToken = async (token: string) => {
  if (!token) {
    return null;
  }

  const session = await verifyAndDecodeToken(token);
  if (!session) {
    return null;
  }

  const userResponse = await UsersService.getUserById(session.user.id);
  if (!userResponse) {
    return null;
  }

  const newSession: Session = {
    id: nanoid(),
    user: userResponse,
  };

  // Create new JWT using jose
  const newToken = await new jose.SignJWT({ ...newSession })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);

  return newToken;
};

export const verifyAndDecodeToken = async (token?: string | null): Promise<Session | null> => {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    // Type guard to ensure session structure
    const session = payload as unknown as Session;
    if (!session.id || !session.user?.id) {
      return null;
    }

    return session;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

export async function login(email: string, password: string) {
  try {
    const token = await getAuthToken(email, password);
    if (!token) {
      throw new Error("Authentication failed");
    }

    // Set a cookie with the token to be used by the server
    cookies().set("authToken", token);

    // Return the token to be used by the session provider
    return token;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Authentication failed");
  }
}
