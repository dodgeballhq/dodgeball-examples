import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyAndDecodeToken } from "./auth";
import { getIsPublicRoute } from "./lib/navigation";

export async function middleware(request: NextRequest) {
  const requestMethod = request.method;
  const requestPath = request.nextUrl.pathname.replace(/\/+$/, "");
  const requestDescription = `${requestMethod} ${requestPath}`;
  console.log("middleware", requestDescription);

  // Define public routes that don't require authentication
  const isPublicRoute = getIsPublicRoute(requestPath);

  // Allow access to public routes regardless of auth status
  if (isPublicRoute) {
    console.log("--- public route");
    return NextResponse.next();
  }

  console.log("--- not a public route");

  // Verify the token and get session
  // Get auth token from Authorization header
  const token = cookies().get("authToken")?.value;
  const session = token ? await verifyAndDecodeToken(token) : null;

  // Handle authentication logic
  if (!session && !isPublicRoute) {
    // Redirect to login if no valid session and trying to access protected route
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // User is authenticated, allow access to protected routes
  return NextResponse.next();
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
