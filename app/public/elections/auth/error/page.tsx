import { buttonVariants } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

const errorMessages: Record<string, { title: string; message: string }> = {
  Configuration: {
    title: "Server Error",
    message: "There's a problem with our server configuration."
  },
  AccessDenied: {
    title: "Access Denied",
    message: "You are not authorize to vote to this election."
  },
  Verification: {
    title: "Verification Failed",
    message: "The verification token has expired or was already used."
  },
  Default: {
    title: "Authentication Error",
    message: "An unexpected error occurred during sign-in."
  }
};

const VoterErrorPage = async (props:{searchParams: Promise<{error:string}>}) => {
  const searchParams = await props.searchParams;
  const { error } = await searchParams
  const voterError = searchParams.error || "Default";
  const errorInfo = errorMessages[voterError] || errorMessages.Default;
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-md flex-col space-y-6">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold">{errorInfo.title}</h1>
          <p className="text-muted-foreground">{errorInfo.message}</p>
        </div>

        <div className="grid gap-4">
          <Link
            href="/public/elections"
            className={buttonVariants({ variant: "default" })}
          >
            Return Home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 rounded-md bg-gray-100 p-4 text-sm text-gray-700">
            <p>Debug info (only shown in development):</p>
            <p className="mt-2 font-mono">Error code: {error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VoterErrorPage