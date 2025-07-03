import Election from "@/app/models/Election"
import connectDB from "@/lib/mongodb"

import { NextRequest } from "next/server"

export const GET = async (req: NextRequest) => {
    const { url } = req
    const electionId = url.split("/").pop()
    try {
      await connectDB()

        const elections = await Election.findOne({
            _id: electionId,
        }).select("-voters").lean()

        return Response.json(elections)
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
