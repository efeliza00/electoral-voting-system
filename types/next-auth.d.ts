// types/next-auth.d.ts or next to your auth config
import "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string // 👈 add this
            name: string
            email: string
            image?: string
        }
    }

    interface User {
        id: string // this is usually enough
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
    }
}
