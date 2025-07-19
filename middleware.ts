import { getToken } from "next-auth/jwt"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Handle ballot routes
    if (pathname.match(/^\/public\/elections\/[^/]+\/ballot$/)) {
        const electionId = pathname.split("/")[3]
        const voteToken = await getToken({
            req: request,
            secret: process.env.VOTER_AUTH_SECRET,
            cookieName: "voter-next-auth.session-token",
        })

        if (!voteToken) {
            return NextResponse.redirect(
                new URL(
                    `/public/elections/auth?callback=${encodeURIComponent(pathname)}`,
                    request.url
                )
            )
        }
        if (voteToken.electionId !== electionId) {
            return NextResponse.redirect(
                new URL(
                    `/public/elections/auth/error?error=${encodeURIComponent("AccessDenied")}`,
                    request.url
                )
            )
        }
        return NextResponse.next()
    }

    // Handle admin routes
    if (pathname.startsWith("/admin")) {
        const adminToken = await getToken({
            req: request,
            secret: process.env.AUTH_SECRET,
            cookieName: "admin-next-auth.session-token",
        })

        // Allow access to login and signup pages without authentication
        if (
            pathname.startsWith("/admin/login") ||
            pathname.startsWith("/admin/signup")
        ) {
            // If already authenticated, redirect to dashboard
            if (adminToken) {
                return NextResponse.redirect(
                    new URL("/admin/dashboard", request.url)
                )
            }
            return NextResponse.next()
        }

        // Redirect to login with callback for all other admin routes if not authenticated
        if (!adminToken) {
            const callbackUrl = encodeURIComponent(
                pathname + request.nextUrl.search
            )
            return NextResponse.redirect(
                new URL(`/admin/login?callback=${callbackUrl}`, request.url)
            )
        }

        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*", "/public/elections/:path*/ballot"],
}
