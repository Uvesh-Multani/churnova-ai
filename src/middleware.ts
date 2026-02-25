import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Passthrough middleware — auth is handled at the page level
// Replace with Clerk middleware when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is configured
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
