"use server"

import User, { UserDocument } from "@/app/models/User"
import { authOptions } from "@/lib/auth"
import cloudinary from "@/lib/cloudinary"
import connectDB from "@/lib/mongodb"

import mongoose from "mongoose"
import { getServerSession } from "next-auth"

type UserInput = Pick<
    UserDocument,
    "_id" 
> & {
    profileImageUrl?: string | ArrayBuffer | null
}

export const updateAccountProfileImage = async (values: UserInput) => {
    try {
        await connectDB()
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) return { error: "Unauthorized" }

        let profileImageUrl: string | undefined

        if (values.profileImageUrl) {
            try {
                const res = await cloudinary.uploader.upload(
                    values.profileImageUrl as string,
                    {
                        folder: "electoral-system-app/user-profile",
                    }
                )

                profileImageUrl = res.secure_url

                const updatedUser= await User.findByIdAndUpdate(
                    values._id,
                    { image: profileImageUrl },
                    { new: true }
                ).lean() as UserDocument

                if (!updatedUser) {
                    return { error: "Failed to update user profile" }
                }
console.log(updatedUser)
                 return {
            success: true,
                   data: updatedUser?.image,
            message: "Profile updated successfully",
        }
            } catch (error) {
                console.error("Cloudinary profile image upload failed:", error)
                return { error: "Failed to upload profile image" }
            }
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
                error: "Some fields have invalid or missing data. Please check the form and try again.",
                details: formatted,
            }
        }

        return {
            error: "An unexpected error occurred. Please try again later."
        }
    }
}