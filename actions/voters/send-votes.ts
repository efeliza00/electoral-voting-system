"use server"

import Election from "@/app/models/Election"
import { authOptions } from "@/lib/auth-voter"
import connectDB from "@/lib/mongodb"
import { Types } from "mongoose"
import { getServerSession } from "next-auth"
import { cookies } from "next/headers"
export const sendVotes = async ({
    voterID,
    votes,
    electionID,
}: {
    voterID: Types.ObjectId
    electionID: Types.ObjectId
    votes: Record<string, string>
}) => {
    try {
        await connectDB()
        const session = await getServerSession(authOptions)
        if (!session?.user?.voterId) return { error: "Unauthorized" }
        const votesArray = Object.values(votes).map(
            (candidateId) => new Types.ObjectId(candidateId)
        )
        await Election.updateOne(
            { _id: electionID, "voters._id": voterID },
            {
                $set: {
                    "voters.$.isVoted": true,
                    "voters.$.votedFor": votesArray,
                },
            }
        );

        (await cookies()).delete("voter-next-auth.session-token")
        return {
            message: "Votes successfully recorded!",
        }
    } catch (error: unknown) {
        console.error("Error recording votes:", error)
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to record votes",
            status: 500,
        }
    }
}
