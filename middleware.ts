import { getToken } from "next-auth/jwt"
import { NextResponse, type NextRequest } from "next/server"


type RoutePattern = string | RegExp

const PUBLIC_ROUTES = [
    "/public",
    "/public/elections",
    /^\/public\/elections\/[^/]+$/,
    /^\/public\/elections\/auth/,
    /^\/public\/elections\/[^/]+\/auth/,
]

const VOTER_ROUTES = [/^\/public\/elections\/[^/]+\/ballot$/]

const ADMIN_ROUTES: RoutePattern[] = [
    "/admin",
    "/admin/dashboard",
    "/admin/dashboard/:path*",
    "/admin/login",
    "/admin/signup",
]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (isPublicRoute(pathname)) {
        return NextResponse.next()
    }

    if (isVoterRoute(pathname)) {
        return handleVoterAuth(request)
    }

    if (isAdminRoute(pathname)) {
        return handleAdminAuth(request)
    }

    return NextResponse.next()
}

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some((pattern) =>
        typeof pattern === "string"
            ? pathname.startsWith(pattern)
            : pattern.test(pathname)
    )
}

function isVoterRoute(pathname: string): boolean {
    return VOTER_ROUTES.some((pattern) =>
        typeof pattern === "string"
            ? pathname === pattern
            : pattern.test(pathname)
    )
}

function isAdminRoute(pathname: string): boolean {
    return ADMIN_ROUTES.some((pattern) =>
        typeof pattern === "string"
            ? pathname.startsWith(pattern)
            : pattern.test(pathname)
    )
}

async function handleVoterAuth(request: NextRequest) {
    const { pathname } = request.nextUrl
    const electionId = pathname.split("/")[3]

    const voteToken = await getToken({
        req: request,
        secret: process.env.VOTER_AUTH_SECRET,
        cookieName: "voter-next-auth.session-token",
    })

    if (!voteToken) {
        return NextResponse.redirect(
            new URL(
                `/public/elections/${electionId}/auth?callback=${encodeURIComponent(pathname)}`,
                request.url
            )
        )
    }

    if (voteToken.electionId !== electionId) {
        return NextResponse.redirect(
            new URL(
                `/public/elections/${electionId}/auth/error?error=${encodeURIComponent("AccessDenied")}`,
                request.url
            )
        )
    }

    return NextResponse.next()
}

async function handleAdminAuth(request: NextRequest) {
    const { pathname } = request.nextUrl
    const isLoginPage = pathname.startsWith("/admin/login")

    const adminToken = await getToken({
        req: request,
        secret: process.env.ADMIN_SECRET,
        cookieName: "admin-next-auth.session-token",
    })

    if (!adminToken && !isLoginPage) {
        return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    if (adminToken && isLoginPage) {
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
    ],
}