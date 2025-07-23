"use server"

import User from "@/app/models/User"
import VerfiyEmailInfo from "@/emails/verify-email"
import connectDB from "@/lib/mongodb"
import crypto from "crypto"
import * as OTPAuth from "otpauth"
import { Resend } from "resend"

const resend = new Resend(`${process.env.RESEND_API_KEY!}`)

export const verifyEmail = async (email: string) => {
    try {
        await connectDB()
        const user = await User.findOne({ email })
          console.log(user)
        if(!user) {
             return { 
              error:"User not found."
            } 
        }
        if(user?.isEmailVerified) {
            return { 
              error:"You are already verified."
            } 
        }

        const emailVerificationToken = crypto.randomBytes(32).toString("base64url")

        const totp = new OTPAuth.TOTP({
            issuer: "Electoral Voting System",
            label: email,
                 algorithm: "SHA1",
            period: 300,
            digits: 6,
            secret: process?.env.OTP_SECRET
        })

        const otp = totp.generate()

        await User.findOneAndUpdate(
            { email },
            { emailVerificationToken: emailVerificationToken },
            { new: true }
        )

        await resend.emails.send({
            headers: { "Reply-To": "" },
            from: "Electoral Voting System <no-reply@votebuddy.cc>",
            to: [email],
            subject: `Verify Your Email - Electoral Voting System`,
            react: VerfiyEmailInfo({ otp, emailVerificationToken: emailVerificationToken })
        })

        return { message: "Email sent successfully." }
        
    } catch (error) {
        console.error("Email verification error:", error)
        return { error: "Failed to send verification email." }
    }
}
