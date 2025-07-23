"use server"

import User from "@/app/models/User"
import connectDB from "@/lib/mongodb"
import * as OTPAuth from "otpauth"

export const verifyOtp = async ({otp,token}:{otp:string,token:string}) => {
    try {
        await connectDB()
        const user = await User.findOne({ emailVerificationToken: token })

        if (!user) {
            return { error: "Invalid verification token" }
        }

        const totp = new OTPAuth.TOTP({
           issuer: "Electoral Voting System",
            label: user?.email,
                 algorithm: "SHA1",
            period: 300,
            digits: 6,
            secret: process?.env.OTP_SECRET
        })

        const delta = totp.validate({ 
            token: otp,
            window: 1 
        })

        if (delta === null) {
            return { error: "Invalid or expired OTP code" }
        }

        await User.findOneAndUpdate(
            { emailVerificationToken: token },
            { 
                isEmailVerified: true, 
                emailVerificationToken: null 
            },
            { new: true }
        )

        return {
            success: true,
            message: "Email address verified successfully"
        }

    } catch (error) {
        console.error("OTP verification error:", error)
        return { error: "Failed to verify OTP" }
    }
}
