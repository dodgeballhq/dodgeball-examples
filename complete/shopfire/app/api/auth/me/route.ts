import { UsersService } from "@/lib/api/users/service";
import { UserResponse } from "@/lib/api/users/types";
import { getApiAuthUser, IJwtPayload } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export interface IMeResponse {
  user: UserResponse | null;
  session: {
    id: string;
  } | null;
}

export async function POST(request: NextRequest): Promise<NextResponse<IMeResponse>> {
  try {
    let payload: IJwtPayload;
    try {
      payload = await getApiAuthUser(request);
    } catch (error) {
      return NextResponse.json({ user: null, session: null }, { status: 200 });
    }

    // At this point payload.userId is known
    // If also using session store, you can check payload.sessionId in DB
    const user = await UsersService.getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ user: null, session: null }, { status: 200 });
    }

    // Explicitly structure the response to avoid circular references
    const response: IMeResponse = {
      session: {
        id: payload.sessionId,
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isIdVerified: user.isIdVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Error in /api/auth/me:", err);
    return NextResponse.json({ user: null, session: null, error: "Internal Server Error" }, { status: 500 });
  }
}
