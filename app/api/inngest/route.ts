import { inngest } from "@/lib/inngest/client";
import { updateElectionStatusCron } from "@/lib/inngest/functions/update-election-status";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    updateElectionStatusCron
  ],
});