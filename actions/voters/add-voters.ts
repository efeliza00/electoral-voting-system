"use server"

import Election, { ElectionDocument } from "@/app/models/Election"
import { authOptions } from "@/lib/auth"
import { generateCode } from "@/lib/formatters/generate-code"
import connectDB from "@/lib/mongodb"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"

export const addVoters = async ({
    voters,
    id,
}: {
    id: string
    voters: string[][]
}) => {
    try {
        await connectDB()
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return { error: "Unauthorized" }

        const usedCodes = new Set<string>()

        const voterRows = voters.filter((row, index) => {
            if (
                index === 0 &&
                row.some((cell) =>
                    ["id", "name", "cluster"].includes(
                        cell?.toString().toLowerCase()
                    )
                )
            ) {
                return false
            }
            return true
        })

        const votersToAdd = await Promise.all(
            voterRows.map(async (row, index) => {
                const code = generateCode(usedCodes)
                return {
                    _id: new mongoose.Types.ObjectId(),
                    voterId:
                        row[0]?.toString() || `temp_${Date.now()}_${index}`,
                    name: row[1]?.toString() || "",
                    cluster: row[2]?.toString() || "",
                    email: row[3]?.toString() || "",
                    isVoted: false,
                    isNotified: false,
                    accessCode: code.toLocaleUpperCase(),
                }
            })
        )

        const voterIds = votersToAdd.map((voter) => voter.voterId)
        const existingElection: ElectionDocument | null =
            await Election.findOne(
                {
                    _id: id,
                    "voters.voterId": { $in: voterIds },
                },
                { "voters.voterId": 1 }
            )

        if (existingElection?.voters?.length) {
            const existingIds = existingElection.voters.map((v) => v.voterId)
            return {
                error: `These voter IDs already exist: ${existingIds.join(", ")}`,
                status: 400,
            }
        }

        if (existingElection?.status === "Ongoing") {
            return {
                error: `This election is currently in an Ongoing process. Adding voters during an election is prohibited.`,
                status: 400,
            }
        }

        await Election.findByIdAndUpdate(
            id,
            {
                $push: {
                    voters: { $each: votersToAdd },
                },
            },
            { new: true, runValidators: true }
        )

        return {
            success: "Successfully Added Voters!",
            count: votersToAdd.length,
        }
    } catch (error: unknown) {
        console.error("Error adding voters:", error)
        return {
            error:
                error instanceof Error ? error.message : "Failed to add voters",
            status: 500,
        }
    }
}
