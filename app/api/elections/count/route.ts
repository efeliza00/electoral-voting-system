
import Election from "@/app/models/Election"
import connectDB from "@/lib/mongodb"


export const GET = async () => {
  try {
      await connectDB()

      const electionCount = await Election.count().lean()
      
        return Response.json(electionCount)
    } catch (error) {
        console.error("Error in GET /api/elections/count:", error)

        if (error) {
            return Response.json(
                { error: "Database connection error" },
                { status: 503 }
            )
        }

        return Response.json(
            { error: "Failed to fetch election count." },
            { status: 500 }
        )
    }
}
