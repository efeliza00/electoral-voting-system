import User from "@/app/models/User"

import bcrypt from "bcryptjs"
import type { NextAuthOptions } from "next-auth"
import credentials from "next-auth/providers/credentials"
import connectDB from "./mongodb"

export const authOptions: NextAuthOptions = {
    secret: process.env.AUTH_SECRET,
    providers: [
        credentials({
            id: "admin",
            name: "Admin Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectDB()
                const user = await User.findOne({
                    email: credentials?.email,
                }).select("+password")

                if (!user) throw new Error("Invalid email or password.")

                const passwordMatch = await bcrypt.compare(
                    credentials!.password,
                    user.password
                )

                if (!passwordMatch) throw new Error("Wrong Password")
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                }
            },
        }),
    ],

    pages: {
        signIn: "admin/login",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.name = user.name
                token.picture = user.image
                token.email = user.email
            }
            if (trigger === "update") {
                return { ...token, ...session.user }
            }

            return { ...token, user }
        },
        async session({ session, token }) {
          session.user = token
            return session
        },
    },
    session: {
        strategy: "jwt",
    },
    cookies: {
        sessionToken: {
            name: `admin-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
}
