import Election from "@/app/models/Election"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import { Types } from "mongoose"

import { getServerSession } from "next-auth"

export const GET = async () => {
    try {
        await connectDB()
        const session = await getServerSession(authOptions)

        if (!session) {
            return Response.json("Unauthorized", { status: 401 })
        }
        const eventElections = await Election.aggregate([
            { $match: { createdBy: new Types.ObjectId(session.user.id) } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    desc: 1,
                    status: 1,
                    startDate: 1,
                    endDate: 1,
                },
            },
        ])


        return Response.json(eventElections)
    } catch (error) {
        return Response.json(error, { status: 500 })
    }
}
