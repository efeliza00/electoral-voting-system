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

type CandidateWithFile = Omit<Candidate, "image"> & {
    image?: string | ArrayBuffer | null
}

type PositionWithFileCandidates = Omit<Position, "candidates"> & {
    candidates: CandidateWithFile[]
}

type ElectionFormInput = Omit<ElectionDocument, "bannerImage" | "positions"> & {
    bannerImage?: string | ArrayBuffer | null
    positions: PositionWithFileCandidates[]
}

export const updateAnElection = async (values: ElectionFormInput) => {
 
  try {
    await connectDB() 
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) return { error: "Unauthorized" }

        const existing = await Election.findOne({ name: values.name })
        if (existing)
            return { error: "Election with the same name already exists!" }

        let bannerImageUrl: string | undefined

        if (values.bannerImage && !isUrl(values.bannerImage as string)) {
            try {
                const newUploadedImage = await cloudinary.uploader.upload(
                    values.bannerImage as string,
                    {
                        folder: "electoral-system-app/elections",
                    }
                )

                if (newUploadedImage?.public_id) {
                    await cloudinary.uploader.destroy(
                        imageIdExtractor(values.bannerImage as string)
                    )
                }

                bannerImageUrl = newUploadedImage.secure_url
            } catch (error) {
                console.error("Cloudinary banner upload failed:", error)
                return { error: "Failed to upload banner image" }
            }
        } else {
            try {
                const newUploadedImage = await cloudinary.uploader.upload(
                    values.bannerImage as string,
                    {
                        folder: "electoral-system-app/elections",
                    }
                )

                bannerImageUrl = newUploadedImage.secure_url
            } catch (error) {
                console.error("Cloudinary banner upload failed:", error)
                return { error: "Failed to upload banner image" }
            }
        }

        const processedPositions = await Promise.all(
            values.positions.map(async (position) => {
                const processedCandidates = await Promise.all(
                    position.candidates.map(async (candidate) => {
                        try {
                            const uploadRes = await cloudinary.uploader.upload(
                                candidate.image as string,
                                {
                                    folder: "electoral-system-app/candidates",
                                }
                            )
                            return { ...candidate, image: uploadRes.secure_url }
                        } catch (err) {
                            console.error(
                                "Cloudinary candidate upload failed:",
                                err
                            )
                            return { ...candidate, image: "" }
                        }
                    })
                )

                return {
                    ...position,
                    candidates: processedCandidates,
                }
            })
        )

        const newElection = new Election({
            ...values,
            bannerImage: bannerImageUrl,
            positions: processedPositions,
            createdBy: session.user.id,
        })

        await newElection.save()

        return {
            success: true,
            message: "Election created successfully",
            election: JSON.parse(JSON.stringify(newElection)),
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
