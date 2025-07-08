"use server"
import Election, { ElectionDocument } from "@/app/models/Election"
import VoterAuthorizationInfo from "@/emails/voter-authorization-info-email"
import connectDB from "@/lib/mongodb"
import { FlattenMaps } from "mongoose"
import { Resend } from "resend"

const resend = new Resend(`${process.env.RESEND_API_KEY!}`)

interface EmailResult {
    id?: string
    error?: Error
}

export async function sendEmail(id: string) {
    if (!id) {
        return { error: "Election ID is required", status: 400 }
    }

    try {
        await connectDB()
        const election = await Election.findById(id)
            .select("name startDate endDate voters")
            .lean<
                FlattenMaps<
                    ElectionDocument & {
                        voters: Array<{
                            email: string
                            name: string
                            cluster: string
                            voterId: string
                            accessCode: string
                            isNotified: boolean
                        }>
                    }
                >
            >()
            .exec()
        if (!election) {
            return { error: "Election not found", status: 404 }
        }

        if (!election.voters || election.voters.length === 0) {
            return { error: "No voters found for this election", status: 400 }
        }
        const votersToNotify = election.voters.filter(
            (voter) => !voter.isNotified
        )

        if (votersToNotify.length === 0) {
            return {
                message: "All voters have already been notified",
                status: 200,
            }
        }

        const emailResults: EmailResult[] = []
        const failedEmails: string[] = []
        const successfullyNotifiedVoterIds: string[] = []

        for (const voter of votersToNotify) {
            try {
                if (!voter.email) {
                    console.warn(`Voter ${voter.voterId} has no email address`)
                    failedEmails.push(voter.voterId)
                    continue
                }

                const result = await resend.emails.send({
                    from: "Electoral Voting System <no-reply@resend.dev>",
                    to: [voter.email],
                    subject: `Your Voting Credentials for ${election.name}`,
                    react: VoterAuthorizationInfo({
                        bannerImage: election.bannerImage,
                        electionName: election.name,
                        startDate: new Date(election.startDate),
                        endDate: new Date(election.endDate),
                        voterInfo: {
                            name: voter.name,
                            cluster: voter.cluster,
                            voterId: voter.voterId,
                            accessCode: voter.accessCode,
                        },
                    }),
                })

                if (result.error) {
                    throw result.error
                }

                emailResults.push({ id: result.data?.id })
                successfullyNotifiedVoterIds.push(voter.voterId)
            } catch (error) {
                console.error(`Failed to send email to ${voter.email}`, error)
                failedEmails.push(voter.voterId)
                emailResults.push({
                    error:
                        error instanceof Error
                            ? error
                            : new Error("Unknown email error"),
                })
            }
        }

        if (successfullyNotifiedVoterIds.length > 0) {
            await Election.updateOne(
                { _id: id },
                { $set: { "voters.$[elem].isNotified": true } },
                {
                    arrayFilters: [
                        {
                            "elem.voterId": {
                                $in: successfullyNotifiedVoterIds,
                            },
                            "elem.isNotified": { $ne: true },
                        },
                    ],
                }
            )
        }

        return {
            success: emailResults.filter((r) => !r.error).length,
            failed: failedEmails.length,
            total: election.voters.length,
            failedVoterIds: failedEmails,
            updatedNotifiedVoters: successfullyNotifiedVoterIds,
        }
    } catch (error) {
        console.error("Error in sending voter emails:", error)
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Internal server error",
            status: 500,
        }
    }
}