import Election, { ElectionDocument } from "@/app/models/Election"
import type { NextAuthOptions } from "next-auth"
import credentials from "next-auth/providers/credentials"
import connectDB from "./mongodb"

export const authOptions: NextAuthOptions = {
    secret: process.env.VOTER_AUTH_SECRET,
    providers: [
        credentials({
            name: "Voter Credentials",
            id: "voter",
            credentials: {
                voterId: { label: "Voter's ID", type: "text" },
                cluster: { label: "Cluster", type: "text" },
                accessCode: { label: "Access Code", type: "password" },
                electionId: { label: "Election ID", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.electionId) {
                    throw new Error("Election ID is required.")
                }

                await connectDB()
                const election: ElectionDocument | null =
                    await Election.findById(credentials.electionId)

                if (!election) {
                    throw new Error(
                        `Election with ID '${credentials.electionId}' not found.`
                    )
                }

                const voter = election.voters.find(
                    (voter) => voter.voterId === credentials?.voterId
                )

                if (!voter) {
                    throw new Error(
                        `Voter with ID '${credentials.voterId}' not found in this election.`
                    )
                }
                if (voter.isVoted) {
                    throw new Error(
                        `${voter.voterId} has already voted to this election.`
                    )
                }
                if (election.status !== "Ongoing") {
                    throw new Error(
                        `Election '${election.name}' is not Ongoing.`
                    )
                }

                const passwordMatch =
                    credentials.accessCode.toLocaleUpperCase() ===
                    voter.accessCode.toLocaleUpperCase()

                if (!passwordMatch) {
                    throw new Error("Invalid access code.")
                }

                return {
                    id: voter._id.toString(),
                    name: voter.name,
                    cluster: voter.cluster,
                    voterId: voter.voterId,
                    electionId: election._id.toString(),
                    message: "Voter verification successful! Redirecting...",
                }
            },
        }),
    ],
    pages: {
        signIn: "/public/elections/auth",
        error: "/public/elections/auth/error",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.voterId = String(user?.voterId)
                token.electionId = String(user?.electionId)
                token.cluster = String(user?.cluster)
            }

            return token
        },
        async session({ session, token }) {
            session.user.id = token.id
            session.user.voterId = token.voterId
            session.user.electionId = token.electionId
            session.user.cluster = token.cluster
            return session
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        },
    },
    session: {
        strategy: "jwt",
    },
    cookies: {
        sessionToken: {
            name: `voter-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
}
