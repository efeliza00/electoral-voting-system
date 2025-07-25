"use server"
import Election, { ElectionDocument } from "@/app/models/Election"
import connectDB from "@/lib/mongodb"

export const exportElectionResults = async (id: string) => {
    try {
        await connectDB()
        if (!id) {
            return Response.json(
                { error: "Election ID is required" },
                { status: 400 }
            )
        }

        const election = await Election.findOne<Pick<ElectionDocument, "_id">>({
            _id: id,
        })
            .select("_id")
            .lean()

        if (!election) {
            return Response.json(
                { error: "Election not found" },
                { status: 404 }
            )
        }

        const electionResult = await Election.aggregate()
            .match({ _id: election._id })
            .unwind({
                path: "$voters",
                preserveNullAndEmptyArrays: true,
            })
            .group({
                _id: "$_id",
                name: { $first: "$name" },
                desc: { $first: "$desc" },
                bannerImage: { $first: "$bannerImage" },
                startDate: { $first: "$startDate" },
                endDate: { $first: "$endDate" },
                status: { $first: "$status" },
                positions: { $first: "$positions" },
                updatedAt: { $first: "$updatedAt" },
                voters: { $push: "$voters" },
                totalClusters: { $addToSet: "$voters.cluster" },
                votedClusters: {
                    $addToSet: {
                        $cond: [
                            { $eq: ["$voters.isVoted", true] },
                            "$voters.cluster",
                            null,
                        ],
                    },
                },
            })
            .addFields({
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
                clusterTurnoutPercentage: {
                    $cond: [
                        { $eq: [{ $size: "$totalClusters" }, 0] },
                        0,
                        {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                {
                                                    $size: {
                                                        $filter: {
                                                            input: "$votedClusters",
                                                            as: "cluster",
                                                            cond: {
                                                                $ne: [
                                                                    "$$cluster",
                                                                    null,
                                                                ],
                                                            },
                                                        },
                                                    },
                                                },
                                                { $size: "$totalClusters" },
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
            })
            .addFields({
                positions: {
                    $map: {
                        input: "$positions",
                        as: "position",
                        in: {
                            $let: {
                                vars: {
                                    candidatesWithVotes: {
                                        $map: {
                                            input: "$$position.candidates",
                                            as: "candidate",
                                            in: {
                                                $let: {
                                                    vars: {
                                                        candidateVotes: {
                                                            $size: {
                                                                $filter: {
                                                                    input: "$voters",
                                                                    as: "voter",
                                                                    cond: {
                                                                        $in: [
                                                                            "$$candidate._id",
                                                                            {
                                                                                $let: {
                                                                                    vars: {
                                                                                        votedForField:
                                                                                            {
                                                                                                $ifNull:
                                                                                                    [
                                                                                                        "$$voter.votedFor",
                                                                                                        [],
                                                                                                    ],
                                                                                            },
                                                                                    },
                                                                                    in: {
                                                                                        $cond: {
                                                                                            if: {
                                                                                                $isArray:
                                                                                                    "$$votedForField",
                                                                                            },
                                                                                            then: "$$votedForField",
                                                                                            else: [
                                                                                                "$$votedForField",
                                                                                            ],
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                    in: {
                                                        $mergeObjects: [
                                                            "$$candidate",
                                                            {
                                                                votes: "$$candidateVotes",
                                                                votePercentage:
                                                                    {
                                                                        $cond: [
                                                                            {
                                                                                $eq: [
                                                                                    "$votedCount",
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
                                                                                                            "$$candidateVotes",
                                                                                                            "$votedCount",
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
                                        },
                                    },
                                },
                                in: {
                                    $mergeObjects: [
                                        "$$position",
                                        {
                                            candidates: "$$candidatesWithVotes",
                                            winners: {
                                                $filter: {
                                                    input: "$$candidatesWithVotes",
                                                    as: "candidate",
                                                    cond: {
                                                        $in: [
                                                            "$$candidate._id",
                                                            "$$position.winners",
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            })
            .project({
                name: 1,
                desc: 1,
                bannerImage: 1,
                startDate: 1,
                status: 1,
                endDate: 1,
                totalVoters: 1,
                votedCount: 1,
                turnoutPercentage: 1,
                clusterTurnoutPercentage: 1,
                positions: 1,
                updatedAt: 1,
            })

        const defaultResultConfig = {
            name: "",
            desc: "",
            bannerImage: "",
            startDate: "",
            status: "",
            endDate: "",
            totalVoters: 0,
            votedCount: 0,
            turnoutPercentage: 0,
            clusterTurnoutPercentage: 0,
            positions: 0,
            updatedAt: "",
        }

        return {
            data: electionResult[0] || defaultResultConfig,
            status: 200,
        }
    } catch (error) {
        console.error("Error in GET /api/elections:", error)

        return {
            error: "Internal server error",
            status: 500,
        }
    }
}
