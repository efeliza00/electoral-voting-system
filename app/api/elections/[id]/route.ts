import Election from "@/app/models/Election"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { Types } from "mongoose"

import { getServerSession } from "next-auth"
import { NextRequest } from "next/server"

export const GET = async (req: NextRequest) => {
    const { url } = req
    const electionId = url.split("/").pop()

    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return Response.json({ error: "Unauthorized." }, { status: 401 })
        }
        await connectDB()

        const elections = await Election.aggregate()
            .match({
                _id: new Types.ObjectId(electionId),
                createdBy: new Types.ObjectId(session.user.id),
            })
            .project({
                name: 1,
                desc: 1,
                status: 1,
                bannerImage: 1,
                startDate: 1,
                endDate: 1,
                positions: {
                    $map: {
                        input: "$positions",
                        as: "position",
                        in: {
                            _id: "$$position._id",
                            title: "$$position.title",
                            description: "$$position.description",
                            winners: "$$position.winners",
                            candidates: {
                                $map: {
                                    input: "$$position.candidates",
                                    as: "candidate",
                                    in: {
                                        _id: "$$candidate._id",
                                        name: "$$candidate.name",
                                        image: "$$candidate.image",
                                        bio: "$$candidate.bio",
                                        voteCount: {
                                            $size: {
                                                $filter: {
                                                    input: "$voters",
                                                    as: "voter",
                                                    cond: {
                                                        $and: [
                                                            {
                                                                $eq: [
                                                                    "$$voter.isVoted",
                                                                    true,
                                                                ],
                                                            },
                                                            {
                                                                $in: [
                                                                    "$$candidate._id",
                                                                    {
                                                                        $ifNull:
                                                                            [
                                                                                "$$voter.votedFor",
                                                                                [],
                                                                            ],
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            totalVotes: {
                                $size: {
                                    $filter: {
                                        input: "$voters",
                                        as: "voter",
                                        cond: {
                                            $and: [
                                                {
                                                    $eq: [
                                                        "$$voter.isVoted",
                                                        true,
                                                    ],
                                                },
                                                {
                                                    $gt: [
                                                        {
                                                            $size: {
                                                                $setIntersection:
                                                                    [
                                                                        {
                                                                            $ifNull:
                                                                                [
                                                                                    "$$voter.votedFor",
                                                                                    [],
                                                                                ],
                                                                        },
                                                                        "$$position.candidates._id",
                                                                    ],
                                                            },
                                                        },
                                                        0,
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                votersNotified: {
                    $size: {
                        $filter: {
                            input: "$voters",
                            as: "voter",
                            cond: { $eq: ["$$voter.isNotified", true] },
                        },
                    },
                },
                totalVoters: { $size: "$voters" },
                votedCount: {
                    $size: {
                        $filter: {
                            input: "$voters",
                            as: "voter",
                            cond: { $eq: ["$$voter.isVoted", true] },
                        },
                    },
                },
            })
            .addFields({
                turnoutPercentage: {
                    $cond: [
                        { $eq: ["$totalVoters", 0] },
                        0,
                        {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                "$votedCount",
                                                "$totalVoters",
                                            ],
                                        },
                                        100,
                                    ],
                                },
                                2,
                            ],
                        },
                    ],
                },
                positions: {
                    $map: {
                        input: "$positions",
                        as: "position",
                        in: {
                            $mergeObjects: [
                                "$$position",
                                {
                                    candidates: {
                                        $sortArray: {
                                            input: {
                                                $map: {
                                                    input: "$$position.candidates",
                                                    as: "candidate",
                                                    in: {
                                                        $mergeObjects: [
                                                            "$$candidate",
                                                            {
                                                                votePercentage:
                                                                    {
                                                                        $cond: [
                                                                            {
                                                                                $eq: [
                                                                                    "$$position.totalVotes",
                                                                                    0,
                                                                                ],
                                                                            },
                                                                            0,
                                                                            {
                                                                                $round: [
                                                                                    {
                                                                                        $multiply:
                                                                                            [
                                                                                                {
                                                                                                    $divide:
                                                                                                        [
                                                                                                            "$$candidate.voteCount",
                                                                                                            "$$position.totalVotes",
                                                                                                        ],
                                                                                                },
                                                                                                100,
                                                                                            ],
                                                                                    },
                                                                                    2,
                                                                                ],
                                                                            },
                                                                        ],
                                                                    },
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            sortBy: { voteCount: -1 },
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            })

        return Response.json(elections[0])
    } catch (error) {
        console.error("Error in GET /api/elections:", error)

        if (error) {
            return Response.json(
                { error: "Database connection error" },
                { status: 503 }
            )
        }

        return Response.json(
            { error: "Failed to fetch elections." },
            { status: 500 }
        )
    }
}