"use server"

import Election, {
    Candidate,
    ElectionDocument,
    Position,
} from "@/app/models/Election"
import { authOptions } from "@/lib/auth"
import cloudinary from "@/lib/cloudinary"
import { imageIdExtractor } from "@/lib/formatters/image-id-extractor"
import { isUrl } from "@/lib/formatters/is-url"
import connectDB from "@/lib/mongodb"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"

type CandidateWithFile = Omit<Candidate, "_id" | "image"> & {
    image?: string | ArrayBuffer | null
}

type PositionWithFileCandidates = Omit<Position, "_id" | "candidates"> & {
    candidates: CandidateWithFile[]
}

type ElectionFormInput = Omit<
    ElectionDocument,
    "status" | "bannerImage" | "positions"
> & {
    bannerImage?: string | ArrayBuffer | null
    positions: PositionWithFileCandidates[]
}

export const updateAnElection = async (values: ElectionFormInput) => {
    try {
        await connectDB()
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) return { error: "Unauthorized" }
        const election = await Election.findById(
            new mongoose.Types.ObjectId(values._id)
        )

        if (election.status === "Ongoing") {
            return {
                error: `This election is currently in an Ongoing process. updating information during an election is prohibited.`,
                status: 400,
            }
        }
        let bannerImageUrl: string | undefined

        const isNewImage =
            typeof values.bannerImage !== "string" ||
            !isUrl(values.bannerImage) ||
            values.bannerImage === ""

        if (isNewImage && values.bannerImage !== "") {
            try {
                if (
                    typeof values.bannerImage === "string" &&
                    isUrl(values.bannerImage)
                ) {
                    await cloudinary.uploader.destroy(
                        imageIdExtractor(values.bannerImage)
                    )
                }

                const uploadResult = await cloudinary.uploader.upload(
                    values.bannerImage as string,
                    { folder: "electoral-system-app/elections" }
                )

                bannerImageUrl = uploadResult.secure_url
            } catch (error) {
                console.error("Cloudinary banner upload failed:", error)
                return { error: "Failed to upload banner image" }
            }
        } else {
            bannerImageUrl = values.bannerImage as string
        }

        const processedPositions = await Promise.all(
            values.positions.map(async (position) => {
                const processedCandidates = await Promise.all(
                    position.candidates.map(async (candidate) => {
                        let candidateImageUrl = ""

                        if (candidate.image) {
                            const isNewImage =
                                typeof candidate.image !== "string" ||
                                !isUrl(candidate.image) ||
                                candidate.image === ""

                            if (isNewImage && candidate.image !== "") {
                                try {
                                    if (
                                        typeof candidate.image === "string" &&
                                        isUrl(candidate.image)
                                    ) {
                                        await cloudinary.uploader.destroy(
                                            imageIdExtractor(candidate.image)
                                        )
                                    }

                                    const uploadResult =
                                        await cloudinary.uploader.upload(
                                            candidate.image as string,
                                            {
                                                folder: "electoral-system-app/candidates",
                                            }
                                        )

                                    candidateImageUrl = uploadResult.secure_url
                                } catch (error) {
                                    console.error(
                                        "Cloudinary candidate upload failed:",
                                        error
                                    )
                                    candidateImageUrl = ""
                                }
                            } else {
                                candidateImageUrl = candidate.image as string
                            }
                        }

                        return { ...candidate, image: candidateImageUrl }
                    })
                )

                return { ...position, candidates: processedCandidates }
            })
        )

        await Election.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(values._id),
                createdBy: session.user.id,
            },
            {
                $set: {
                    ...values,
                    bannerImage: bannerImageUrl,
                    positions: processedPositions,
                },
            },
            {
                runValidators: true,
                context: "query",
            }
        )

        return {
            success: true,
            message: "Election Updated successfully",
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
    }
}
