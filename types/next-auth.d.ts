// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string
            voterId: string
            electionId: string
            cluster: string
            isEmailVerified: boolean
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        voterId?: string
        electionId?: string
        cluster?: string
        isEmailVerified: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        voterId: string
        electionId: string
        cluster: string
        isEmailVerified: boolean
    }
}
