import Election, { ElectionDocument } from "@/app/models/Election"
import VoterAuthorizationInfo from "@/emails/voter-authorization-info-email"
import { authOptions } from "@/lib/auth-voter"
import dbConnect from "@/lib/mongodb"
import { FlattenMaps } from "mongoose"
import { getServerSession } from "next-auth/next"
import { NextRequest } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailResult {
  id?: string
  error?: Error
}

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get("id")
  
  if (!id) {
    return Response.json({ error: "Election ID is required" }, { status: 400 })
  }

  try {
    await dbConnect()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const election = await Election.findById(id)
      .select("name startDate endDate voters")
      .lean<FlattenMaps<ElectionDocument & { voters: Array<{ 
        email: string;
        name: string;
        cluster: string;
        voterId: string;
        accessCode: string;
      }> }>>()
      .exec()
    if (!election) {
      return Response.json({ error: "Election not found" }, { status: 404 })
    }

    if (!election.voters || election.voters.length === 0) {
      return Response.json({ error: "No voters found for this election" }, { status: 400 })
    }

    const emailResults: EmailResult[] = []
    const failedEmails: string[] = []

    for (const voter of election.voters) {
      try {
        if (!voter.email) {
          console.warn(`Voter ${voter.voterId} has no email address`)
          failedEmails.push(voter.voterId)
          continue
        }

        const result = await resend.emails.send({
          from: "Electoral Voting System <no-reply@yourdomain.com>",
          to: [voter.email],
          subject: `Your Voting Credentials for ${election.name}`,
          react: VoterAuthorizationInfo({
            electionName: election.name,
            startDate: new Date(election.startDate),
            endDate: new Date(election.endDate),
            voterInfo: {
              name: voter.name,
              cluster: voter.cluster,
              voterId: voter.voterId,
              accessCode: voter.accessCode

            }
          }),
        })

        if (result.error) {
          throw result.error
        }

        emailResults.push({ id: result.data?.id })
      } catch (error) {
        console.error(`Failed to send email to ${voter.email}`, error)
        failedEmails.push(voter.voterId)
        emailResults.push({ error: error instanceof Error ? error : new Error('Unknown email error') })
      }
    }

    return Response.json({
      success: emailResults.filter(r => !r.error).length,
      failed: failedEmails.length,
      total: election.voters.length,
      failedVoterIds: failedEmails
    })

  } catch (error) {
    console.error("Error in sending voter emails:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}