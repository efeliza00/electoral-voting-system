"use server"
import User, { UserDocument } from "@/app/models/User"
import connectDB from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export const signUp = async (
    values: Omit<
        UserDocument,
        | "_id"
        | "image"
        | "createdAt"
        | "updatedAt"
        | "resetPasswordToken"
        | "resetPasswordExpiry"
        | "emailVerificationToken"
        | "isEmailVerified"
    >
) => {
    const { email, password, name } = values

    try {
        await connectDB()
        const userFound = await User.findOne({ email })
        if (userFound) {
            return {
                error: "Email already exists!",
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({
            name,
            email,
            image: "",
            password: hashedPassword,
        })

        await user.save()
    } catch (e) {
        console.log(e)
    }
}
