
import { sendEmail } from "@/app/actions/voters/send-email";
import { inngest } from "../client";

export const sendNotifyVoters = inngest.createFunction(
  { id: "notify-voters" },
  { event: "app/notify.voters" },
  async ({ event , step }) => {
    await step.run("send-email", async () => {
        const { id } = event?.data
        const res = await sendEmail(id)
        console.log(res)
        return res
    })
  }
);