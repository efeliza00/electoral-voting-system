// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string
            voterId: string
            electionId: string
            cluster: string
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        voterId?: string
        electionId?: string
        cluster?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        voterId: string
        electionId: string
        cluster: string
    }
}
