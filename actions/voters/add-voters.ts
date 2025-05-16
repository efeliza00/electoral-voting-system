"use server"

import Election, { ElectionDocument } from "@/app/models/Election"
import { authOptions } from "@/lib/auth"
import { generateCode } from "@/lib/formatters/generate-code"
import connectDB from "@/lib/mongodb"
import bcrypt from "bcryptjs"

import { getServerSession } from "next-auth"


const usedCodes = new Set<string>();
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

        const votersToAdd = await Promise.all(
            voters.map(async (row, index) => {
                if (
                    index === 0 &&
                    row.some(
                        (cell) =>
                            typeof cell === "string" &&
                            ["id", "name"].includes(cell.toString().toLowerCase())
                    )
                ) {
                    return null; // Skip header row
                }
        
                const code = generateCode(usedCodes);
                const hashedCode = await bcrypt.hash(code, 10);
        
                return {
                    id: row[0]?.toString() || `temp_${Date.now()}_${index}`,
                    name: row[1]?.toString() || "",
                    isVoted: false,
                    votersCode: hashedCode,
                };
            })
        );
        

        const existingVoters: ElectionDocument | null = await Election.findOne(
            {
                _id: id,
                "voters.id": { $in: votersToAdd.map((voter) => voter?.id )},
            },
            { "voters.id": 1 }
        )

        if (existingVoters?.voters?.length) {
            const existingIds = existingVoters.voters.map((voter) => voter?.id)
            return {
                error: `These voter IDs already exist: ${existingIds.join(", ")}`,
                status: 400,
            }
        }

              await Election.findByIdAndUpdate(
            id,
            {
                $push: {
                    voters: {
                        $each: votersToAdd,
                    },
                },
            },
            {
                new: true,
                runValidators:true
            }
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
