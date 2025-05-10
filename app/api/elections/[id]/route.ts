import Election from "@/app/models/Election"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"

import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (req: NextRequest) => {
    const { url } = req
    const electionId = url.split("/").pop()

    try {
      await connectDB()
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized." },
                { status: 401 }
            )
        }

        const elections = await Election.findOne({
            _id: electionId,
            createdBy: session.user.id,
        })

        return NextResponse.json(elections)
    } catch (error) {
        console.error("Error in GET /api/elections:", error)

        if (error) {
            return NextResponse.json(
                { error: "Database connection error" },
                { status: 503 }
            )
        }

        return NextResponse.json(
            { error: "Failed to fetch elections." },
            { status: 500 }
        )
    }
}
