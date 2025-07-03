import { updateElectionStatus } from "@/app/actions/election/update-election-status";
import { inngest } from "../client";

export const updateElectionStatusCron  = inngest.createFunction(
  { id: "electoral-voting-system" },
  { cron: "* * * * *" },
  async () => {
     const res = await updateElectionStatus()
    return { message: res?.message };
  },
);
