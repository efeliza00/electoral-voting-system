"use server"
import Election, { Candidate } from "@/app/models/Election"
import connectDB from "@/lib/mongodb"
import mongoose from "mongoose"

export const updateElectionStatus = async () => {
    try {
        const currentDate = new Date()

        await connectDB()

        await Election.updateMany(
            {
                startDate: { $lte: currentDate },
                status: { $eq: "Unavailable" },
            },
            {
                $set: {
                    status: "Ongoing",
                },
            }
        )

        const electionsToComplete = await Election.find({
            endDate: { $lte: currentDate },
            status: { $eq: "Ongoing" },
        })

        for (const election of electionsToComplete) {
            const candidateVoteCounts = new Map<string, number>()

            for (const voter of election.voters) {
                if (voter.votedFor && Array.isArray(voter.votedFor)) {
                    for (const candidateId of voter.votedFor) {
                        const idString = candidateId.toString()
                        candidateVoteCounts.set(
                            idString,
                            (candidateVoteCounts.get(idString) || 0) + 1
                        )
                    }
                }
            }

            for (const position of election.positions) {
                const candidatesWithVotes: {
                    candidateId: mongoose.Types.ObjectId
                    voteCount: number
                }[] = position.candidates.map((candidate: Candidate) => ({
                    candidateId: candidate._id,
                    voteCount:
                        candidateVoteCounts.get(candidate._id.toString()) || 0,
                }))

                const nonZeroCandidates = candidatesWithVotes.filter(
                    (c) => c.voteCount > 0
                )
                nonZeroCandidates.sort((a, b) => b.voteCount - a.voteCount)

                const winners =
                    nonZeroCandidates.length > 0
                        ? nonZeroCandidates
                              .slice(0, position.numberOfWinners)
                              .map((c) => c.candidateId)
                        : []

                position.winners = winners
            }
            election.status = "Completed"
            await election.save()
        }

        return {
            success: true,
            message: "Election Updated successfully",
        }
    } catch (error: unknown) {
        console.error("Unexpected error:", error)

        if (error instanceof mongoose.Error.ValidationError) {
            const formatted = Object.entries(error.errors).reduce(
                (acc, [key, val]) => {
                    acc[key] = val.message
                    return acc
                },
                {} as Record<string, string>
            )

            return {
                error: "Some fields have invalid or missing data. Please check the form and try again.",
                details: formatted,
            }
        }
    }
}
