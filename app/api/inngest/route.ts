import { inngest } from "@/lib/inngest/client"
import { sendNotifyVoters } from "@/lib/inngest/functions/send-notify-voters"
import { updateElectionStatusCron } from "@/lib/inngest/functions/update-election-status"
import { serve } from "inngest/next"

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [updateElectionStatusCron, sendNotifyVoters],
})
