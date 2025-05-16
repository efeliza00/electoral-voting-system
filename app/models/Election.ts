import mongoose, { Schema, Types, model } from "mongoose"
import { UserDocument } from "./User"

export interface Candidate {
    _id: Types.ObjectId
    name: string
    bio: string
    image?: string
}

export interface Position {
    _id: Types.ObjectId
    title: string
    description?: string
    numberOfWinners: number
    candidates: Candidate[]
    winners: Types.ObjectId[]
}

export interface Voter {
    _id: Types.ObjectId
    id: string
    name: string
    isVoted: boolean
    votersCode: string
}

export interface ElectionDocument {
    _id: Types.ObjectId
    status: string
    name: string
    desc: string
    bannerImage: string
    createdBy: Types.ObjectId | UserDocument
    startDate: Date
    positions: Position[]
    voters: Voter[]
    endDate: Date
    createdAt: Date
    updatedAt: Date
}

const CandidateSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Candidate name is required"],
            trim: true,
        },
        bio: {
            type: String,
            required: [true, "Candidate bio is required"],
            trim: true,
        },
        image: {
            type: String,
            required: false,
        },
    },
    { _id: true }
)

const PositionSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Position title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: false,
        },
        numberOfWinners: {
            type: Number,
            required: [true, "Number of winners is required"],
            min: 1,
            default: 1,
        },
        candidates: {
            type: [CandidateSchema],
            required: [false],
        },
        winners: [
            {
                type: Schema.Types.ObjectId,
                ref: "Candidate",
                required: false,
            },
        ],
    },
    { _id: true }
)

const VoterSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        name: {
            type: String,
            required: [true, "Voter name is required"],
            trim: true,
        },
        isVoted: {
            type: Boolean,
            default: false,
        },
        votersCode: {
            type: String,
            required: [true, "Voter code is required"],
            unique: true,
            trim: true,
        },
    },
    { _id: true }
)

const ElectionSchema = new Schema<ElectionDocument>(
    {
        name: {
            type: String,
            required: [true, "Election name is required"],
            trim: true,
            unique: true,
        },
        desc: {
            type: String,
            required: [true, "Election description is required"],
            trim: true,
        },
        status: {
            type: String,
            required: false,
            trim: true,
        },
        bannerImage: {
            type: String,
            required: false,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Creator reference is required"],
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required"],
            validate: {
                validator: function (this: ElectionDocument, value: Date) {
                    return this.endDate ? value < this.endDate : true
                },
                message: "Start date must be before end date",
            },
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"],
            validate: {
                validator: function (this: ElectionDocument, value: Date) {
                    return this.startDate ? value > this.startDate : true
                },
                message: "End date must be after start date",
            },
        },
        positions: {
            type: [PositionSchema],
            required: false,
        },
        voters: {
            type: [VoterSchema],
            required: false,
            default: [],
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                ret.id = ret._id
                delete ret._id
                delete ret.__v
            },
        },
        _id: true,
    }
)

ElectionSchema.path("positions").validate(function (positions: Position[]) {
    const titles = positions.map((p) => p.title)
    return new Set(titles).size === titles.length
}, "Position titles must be unique within an election")

const Election =
    mongoose.models?.Election ||
    model<ElectionDocument>("Election", ElectionSchema)
export default Election
