import Election from "@/app/models/Election"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { Types } from "mongoose"

import { getServerSession } from "next-auth"
import { NextRequest } from "next/server"

export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.nextUrl)
    const rows = parseInt(searchParams.get("rows") || "10", 10)
    const page = parseInt(searchParams.get("page") || "1", 10)

    try {
        await connectDB()
        const session = await getServerSession(authOptions)

        if (!session) {
            return Response.json("Unauthorized", { status: 401 })
        }

        if (page <= 0) {
            return Response.json("Page not found", { status: 404 })
        }

        const elections = await Election.aggregate([
            { $match: { createdBy: new Types.ObjectId(session.user.id) } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    desc: 1,
                    status: 1,
                    voterCount: { $size: "$voters" },
                    startDate: 1,
                    endDate: 1,
                },
            },
            { $skip: (page - 1) * rows },
            { $limit: rows },
        ])

        const totalElectionsCount = await Election.countDocuments({
            createdBy: session.user.id,
        })
        const skip = (page - 1) * rows

        if (page) {
            if (skip >= totalElectionsCount) {
                return Response.json(
                    {
                        resultsCount: 0,
                        totalResultsCount: totalElectionsCount,
                        elections: [],
                        message: "No more elections available",
                    },
                    { status: 200 }
                )
            }
        }

        return Response.json({
            resultsCount: elections.length,
            totalResultsCount: totalElectionsCount,
            elections,
        })
    } catch (error) {
        return Response.json(error, { status: 500 })
    }
}
