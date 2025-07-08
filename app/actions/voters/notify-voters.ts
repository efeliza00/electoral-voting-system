"use server"
import { authOptions } from "@/lib/auth"
import { inngest } from "@/lib/inngest/client"
import { getServerSession } from "next-auth/next"

export const notifyVoters = async (id: string) =>{
   const session = await getServerSession(authOptions)
          if (!session?.user?.id) {
              return { error: "Unauthorized", status: 401 }
          }
  
  await inngest.send({
            name: "app/notify.voters",
            data: { id }
          })
}