import Election from "@/app/models/Election"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { Types } from "mongoose"
import { getServerSession } from "next-auth/next"

export const GET = async () => {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return Response.json("Unauthorized", { status: 401 })
        }
        await connectDB()

        const overview = await Election.aggregate()
            .match({ createdBy: new Types.ObjectId(session.user.id) })
            .group({
                _id: null,
                totalElections: { $sum: 1 },
                ongoingElections: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "Ongoing"] }, 1, 0],
                    },
                },
                totalVoters: { $sum: { $size: "$voters" } },
                votesCast: {
                    $sum: {
                        $size: {
                            $filter: {
                                input: "$voters",
                                as: "voter",
                                cond: { $eq: ["$$voter.isVoted", true] },
                            },
                        },
                    },
                },
            })
            .project({
                totalVoterTurnout: {
                    $cond: [
                        { $eq: ["$totalVoters", 0] },
                        0,
                        {
                            $multiply: [
                                {
                                    $divide: ["$votesCast", "$totalVoters"],
                                },
                                100,
                            ],
                        },
                    ],
                },
                totalElections: 1,
                ongoingElections: 1,
                totalVoters: 1,
                votesCast: 1,
            })

        const defaultOverview = {
            totalElections: 0,
            ongoingElections: 0,
            totalVoters: 0,
            votesCast: 0,
            totalVoterTurnout: 0,
        }

        return Response.json(overview[0] || defaultOverview)
    } catch (error) {
        return Response.json(error, { status: 500 })
    }
}
