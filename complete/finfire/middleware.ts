import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyJwt } from "./lib/auth";
import { getIsPublicRoute, NavigationRoutes } from "./lib/navigation";

export async function middleware(request: NextRequest) {
  const requestMethod = request.method;
  const requestPath = request.nextUrl.pathname.replace(/\/+$/, "");
  const requestDescription = `${requestMethod} ${requestPath}`;

  // Define public routes that don't require authentication
  const isPublicRoute = getIsPublicRoute(requestPath);
  const isPublicDescription = isPublicRoute ? "public" : "🔒";
  console.log("middleware ::", requestDescription, "::", isPublicDescription);

  // Allow access to public routes regardless of auth status
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verify the token and get session
  // Get auth token from Authorization header
  const token = cookies().get("authToken")?.value;
  if (!token) {
    // If no token, redirect to login
    console.warn("middleware ::", requestDescription, "::", "🔒", "No token found");
    return NextResponse.redirect(new URL(NavigationRoutes.LOGIN, request.url));
  }
  try {
    const tokenPayload = await verifyJwt(token);
    console.log("middleware ::", requestDescription, "::", "🔒", "Token verified", tokenPayload);
    // If valid, continue to the requested route
    return NextResponse.next();
  } catch (err) {
    // If invalid or expired, redirect to login
    console.warn("middleware ::", requestDescription, "::", "🔒", "Failed to verify token", JSON.stringify(err));
    return NextResponse.redirect(new URL(NavigationRoutes.LOGIN, request.url));
  }
}

// Configure which routes should be processed by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|images|favicon.ico|public/).*)",
  ],
};
