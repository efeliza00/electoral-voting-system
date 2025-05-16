import Election from "@/app/models/Election"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"

import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.nextUrl)
    const rows = parseInt(searchParams.get("rows") || "10", 10)
    const page = parseInt(searchParams.get("page") || "1", 10)

    try {
        await connectDB()
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized." },
                { status: 401 }
            )
        }

        if (page <= 0) {
            return NextResponse.json(
                { error: "Page not found." },
                { status: 404 }
            )
        }

        const elections = await Election.find({
            createdBy: session.user.id,
        })
            .skip((page - 1) * rows)
            .limit(rows)
            .lean()

        const totalElectionsCount = await Election.countDocuments({
            createdBy: session.user.id,
        })
        const skip = (page - 1) * rows

        if (page) {
            if (skip >= totalElectionsCount) {
                return NextResponse.json(
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

        return NextResponse.json({
            resultsCount: elections.length,
            totalResultsCount: totalElectionsCount,
            elections,
        })
    } catch (error) {
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
