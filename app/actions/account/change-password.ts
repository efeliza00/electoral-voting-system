"use server"

import User from "@/app/models/User"
import connectDB from "@/lib/mongodb"
import bcrypt from "bcryptjs"


export const changePassword = async ({resetPasswordToken,password}:{resetPasswordToken:string,password:string}) => {
    try {
        await connectDB()
        const user = User.findOne({ resetPasswordToken })

        if(!user){
                throw new Error("Unauthorized")
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await User.findOneAndUpdate(
            { resetPasswordToken },
            { password: hashedPassword, resetPasswordToken:null, resetPasswordExpiry:null },
            { new: true }
        )


                      return {
                        message: "Password changed successfully."
                      }
        
    } catch (error: unknown) {
        console.error("Unexpected error:", error)
            return {
                error: "Something went wrong while changing the password.",
            }
        }
}
