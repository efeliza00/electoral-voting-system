"use server"

import User from "@/app/models/User"
import connectDB from "@/lib/mongodb"
import crypto from "crypto"
import { Resend } from "resend"

const resend = new Resend(`${process.env.RESEND_API_KEY!}`)


import ResetPasswordInfo from "@/emails/reset-password-email"


export const resetPassword = async (email: string) => {
    try {
        await connectDB()
        const user = User.findOne({ email })

        if(!user){
                throw new Error("User not Found")
        }

        const resetPasswordToken = crypto.randomBytes(32).toString("base64url")
        const today  = new Date()
        const  expiryDate = today.setDate(today.getDate() + 1)

        await User.findOneAndUpdate(
            { email },
            { resetPasswordToken: resetPasswordToken, resetPasswordExpiry: expiryDate },
            { new: true }
        )

      await resend.emails.send({
                          headers: {
                              "Reply-To": "",
                          },
                          from: "Electoral Voting System <no-reply@votebuddy.cc>",
                          to: [email],
      
                          subject: `Reset Your Password - Electoral Voting System`,
                          react: ResetPasswordInfo({ email, resetPasswordToken})
                      })

                      return "Email sent successfully."
        
    } catch (error: unknown) {
        console.error("Unexpected error:", error)
            return "Some fields have invalid or missing data. Please check the form and try again."
        }
}
