import { UsersService } from "@/lib/api/users/service";
import { signJwt, verifyPassword } from "@/lib/auth";
import { executeDodgeballEvent } from "@/lib/dodgeball-extensions/server-helpers";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  sourceToken: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const requestBody = await request.json();
    const { email, password, sourceToken } = loginSchema.parse(requestBody);
    const ipAddress = request.headers.get("x-forwarded-for");

    // 1. Validate user in DB
    // Not using UsersService because we need to return the hashed password
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isCorrectPassword = verifyPassword(password, user.hashedPassword);
    if (!isCorrectPassword) {
      console.log("Sending LOGIN_BAD_CREDENTIALS event");
      const result = await executeDodgeballEvent({
        eventName: "LOGIN_BAD_CREDENTIALS",
        payload: {
          customer: {
            primaryEmail: email,
          },
        },
        sourceToken: sourceToken,
        userId: user.id,
      });
      console.log("LOGIN_BAD_CREDENTIALS event sent", result);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const userResponse = UsersService.convertUserToUserResponse(user);

    // 2. Generate JWT
    const token = await signJwt(user.id);

    // 3. Set HTTP-only cookie with the token
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "authToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day in seconds
    });
    return response;
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
