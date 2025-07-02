"use server"

import Election from "@/app/models/Election"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"

import mongoose, { Types } from "mongoose"
import { getServerSession } from "next-auth"



export const deleteAnElection = async (id:Types.ObjectId) => {
  
  try {
    await connectDB()
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) return { error: "Unauthorized" }
         const election = await Election.findById(id)

         if (election.status === "Ongoing") {
             return {
                 error: `This election is currently in an Ongoing process. updating information during an election is prohibited.`,
                 status: 400,
             }
         }
        

        await Election.findByIdAndDelete({ _id:id})
        return {
            success: true,
            message: "Election has been deleted successfully."
        }
    } catch (error: unknown) {
        console.error("Unexpected error:", error)

        if (error instanceof mongoose.Error.ValidationError) {
            const formatted = Object.entries(error.errors).reduce(
                (acc, [key, val]) => {
                    acc[key] = val.message
                    return acc
                },
                {} as Record<string, string>
            )

            return {
                error: "Failed to Delete.",
                details: formatted,
            }
        }
    }
}
