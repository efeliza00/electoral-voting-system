import User from "@/app/models/User"

import bcrypt from "bcryptjs"
import type { NextAuthOptions } from "next-auth"
import credentials from "next-auth/providers/credentials"
import { connectDB } from "./mongodb"

export const authOptions: NextAuthOptions = {
    providers: [
        credentials({
            name: "Credentials",
            id: "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
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

                // Return user object with id field
                return {
                    id: user._id.toString(), // Convert MongoDB _id to string
                    name: user.name,
                    email: user.email,
                    image: user.image,
                }
            },
        }),
    ],

    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id // Use the id we returned from authorize
            }
            return token
        },
        async session({ session, token }) {
            if (token?.id) {
                session.user.id = token.id
            }
            return session
        },
    },
    session: {
        strategy: "jwt",
    },
}
