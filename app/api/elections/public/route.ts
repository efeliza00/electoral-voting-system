import Election from "@/app/models/Election"
import connectDB from "@/lib/mongodb"

export const GET = async () => {
    try {
        await connectDB()
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)

        const endOfToday = new Date()
        endOfToday.setHours(23, 59, 59, 999)
        const ongoingElections = await Election.aggregate([
            {
                $match: {
                    status: { $eq: "Ongoing" },
                },
            },
            {
                $project: {
                    name: 1,
                    desc: 1,
                    bannerImage: 1,
                    startDate: 1,
                    status: 1,
                    endDate: 1,
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
                 
                },
            },
            {
                $addFields: {
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
                },
            },
        ])

        const otherElections = await Election.aggregate([
            {
                $match: {
                    status: { $ne: "Ongoing" },
                },
            },
            {
                $project: {
                    name: 1,
                    desc: 1,
                    status: 1,
                    bannerImage: 1,
                    startDate: 1,
                    endDate: 1,
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
                },
            },
            {
                $addFields: {
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
                },
            },
        ])

        const upComingElections = await Election.find({
            startDate: {
                $gte: startOfToday,
                $lte: endOfToday,
            },
            status: {
                $eq: "Unavailable",
            },
        })
            .select("-voters -positions -desc")
            .lean()

        return Response.json({
            ongoingElections,
            otherElections,
            upComingElections,
        })
    } catch (error) {
      
        console.log(error)
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
