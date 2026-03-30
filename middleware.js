import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isClerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

// Clerk middleware for session management
// All routes are public by default — Clerk just attaches auth state
// Admin protection is handled in the API routes and login page
export default isClerkEnabled
  ? clerkMiddleware()
  : () => NextResponse.next()

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
