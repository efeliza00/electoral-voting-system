import { getToken } from "next-auth/jwt"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    if (
        request.nextUrl.pathname.match(/^\/public\/elections\/[^/]+\/ballot$/)
    ) {
        const electionId = request.nextUrl.pathname.split("/")[3]
        const voteToken = await getToken({
            req: request,
            secret: process.env.VOTER_AUTH_SECRET,
            cookieName: "voter-next-auth.session-token",
        })

        if (!voteToken) {
            return NextResponse.redirect(
                new URL(
                    `/public/elections/auth?callback=${encodeURIComponent(request.nextUrl.pathname)}`,
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

    const adminToken = await getToken({
        req: request,
        secret: process.env.ADMIN_SECRET,
        cookieName: "admin-next-auth.session-token",
    })

    if (!adminToken && !request.nextUrl.pathname.startsWith("/admin/login")) {
        return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    if (adminToken && request.nextUrl.pathname.startsWith("/admin/login")) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/admin/dashboard",
        "/admin/dashboard/:path*",
        "/admin/login",
        "/admin/signup",
        "/public/elections/:path*",
        "/((?!api|_next/static|_next/image|favicon.ico|images|assets|public/elections$|public/elections/[^/]+$).*)",
    ],
}