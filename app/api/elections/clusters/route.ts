import Election from "@/app/models/Election"
import connectDB from "@/lib/mongodb"
import mongoose from "mongoose"

import { NextRequest } from "next/server"

export const GET = async (req:NextRequest) => {
  const searchParams = new URL(req.nextUrl).searchParams
  const electionId = searchParams.get('q') || ""


  try {
      await connectDB()
      console.log(electionId)

      const clusters = await Election.aggregate<{id: string; name: string}>([
        { $match: { _id: new mongoose.Types.ObjectId(electionId) } },
        { $unwind: "$voters" },
        { $group: { 
          _id: "$voters.cluster" 
        }},
        { $sort: { _id: 1 } },
        { $project: {
          _id: 0,  
          id: new mongoose.Types.ObjectId(electionId).toString(),  
          name: "$_id"  
        }}
      ]);
      
        return Response.json(clusters)
    } catch (error) {
        console.error("Error in GET /api/elections/clusters:", error)

        if (error) {
            return Response.json(
                { error: "Database connection error" },
                { status: 503 }
            )
        }

        return Response.json(
            { error: "Failed to fetch clusters." },
            { status: 500 }
        )
    }
}
