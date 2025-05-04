import User from "@/app/models/User"
import { connectDB } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import type { NextAuthOptions } from "next-auth"
import credentials from "next-auth/providers/credentials"

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
                  console.log(user)
                return user
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
}
