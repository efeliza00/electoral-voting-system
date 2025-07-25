import mongoose, { Schema, model } from "mongoose"

export interface UserDocument {
    _id: string
    email: string
    password: string
    name: string
    image?: string
    resetPasswordToken?: string
    resetPasswordExpiry?: Date
    isEmailVerified: boolean
    emailVerificationToken?: string
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<UserDocument>(
    {
        email: {
            type: String,
            unique: true,
            required: [true, "Email is required."],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Email is invalid.",
            ],
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: [true, "Name is required."],
        },
        image: {
            type: String,
            required: false,
        },
        resetPasswordToken: {
            type: String,
            unique: true,
            required: false,
        },
        resetPasswordExpiry: {
            type: Date,
            required: false,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
            unique: true,
            required: false,
        },
    },
    {
        timestamps: true,
    }
)

const User = mongoose.models?.User || model<UserDocument>("User", UserSchema)
export default User
