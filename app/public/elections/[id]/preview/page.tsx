"use client"
import { Candidate, ElectionDocument, Position } from "@/app/models/Election"
import { ErrorMessages } from "@/components/error-messages"
import Loader from "@/components/loader"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import {
  AlertCircle,
  BarChart2,
  Boxes,
  CheckCircle,
  CircleAlert,
  ClockArrowUp, RefreshCw,
  TrendingUp,
  Users
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import useSWR from "swr"

type ElectionInfo = Omit<ElectionDocument, "voters" | "positions" > & {
    totalVoters: number
    votedCount: number
    turnoutPercentage: number
    clusterTurnoutPercentage: number
    positions: (Omit<Position, "candidates"> & {
        totalVotes: number
        candidates: (Candidate & {
            votes: number
            votePercentage: number
        })[]
    })[]
}

const fetcher = async (url: string) => {
    const res = await fetch(url)

    if (!res.ok) {
        const errorData = await res.json()
        const error = new Error(errorData.error) as Error & { status: number }
        error.status = res.status

        throw error
    }

    return res.json()
}

const BallotPreviewPage = () => {
  const router = useRouter()
    const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(false)
    const handleAutoRefreshToggle = () => {
        setIsAutoRefresh((prevState) => !prevState)
    }
    const { id } = useParams()
    const { data, error, isLoading, mutate } = useSWR<ElectionInfo>(
        `/api/elections/public/${id}/preview`,
        fetcher,
        {
            refreshInterval: isAutoRefresh ? 60000 : undefined,
            revalidateOnFocus: false,
        }
    )

    if (isLoading)
        return (
          <div className="min-h-screen w-full flex items-center justify-center">
            <Loader />
            </div>
        )
   if (data?.status === "Completed" || data?.status === "Unavailable") {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="bg-orange-100/80 dark:bg-orange-900/20 rounded-full p-6">
        <CircleAlert className="size-24 text-orange-500 dark:text-orange-400" />
      </div>

      <div className="space-y-3 max-w-md">
        <h1 className="text-4xl font-light text-foreground">
          Election has ended
        </h1>
        <p className="text-muted-foreground">
          This election has ended. You can view the final results on the results page.
        </p>
      </div>
      <Button
        onClick={() => router.push(`/public/elections/${String(data?._id)}/results`)}
        className="mt-4"
        size="lg"
      >
        <BarChart2 className="mr-2 h-4 w-4" />
        View Official Results
      </Button>
    </div>
  );
}
    if (error) return <ErrorMessages errors={error} />

    return (
      <div className="w-full space-y-4  my-26 p-4 md:p-0">
        <h1 className="text-primary-foreground bg-primary bg-gradient-to-r from-primary to-purple-700 text-center p-4 text-5xl shadow">
          Preview
        </h1>
        <div className="flex flex-col md:flex-row gap-2 md:justify-between">

                <div className="space-y-1.5">

            <h1 className="text-3xl md:text-5xl text-muted-foreground font-light capitalize">
              {data?.name}
                    </h1>
            <div className="flex flex-col md:flex-row gap-2 md:items-center ">
              <div className="flex items-center gap-2">
                <ClockArrowUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">{format(data?.updatedAt as Date, "'Last updated: ' MMM dd, yyy 'at' hh:mm a")}</p>
              </div>
              <p className="">
                • <span className="text-muted-foreground">Auto-refresh:{" "}
                  {isAutoRefresh ? "On" : "Off"}</span>
              </p>
            </div>

          </div>
          <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleAutoRefreshToggle}
                        className={`${isAutoRefresh && "bg-green-200/30 border border-green-300"}`}
                    >
                        {" "}
                        <RefreshCw
                            className={`${isAutoRefresh && "animate-spin"}`}
                        />
                        <span>Auto-refresh {isAutoRefresh ? "On" : "Off"}</span>
                    </Button>
                    <Button variant="outline" onClick={() => mutate()}>Refresh now</Button>
                </div>
            </div>
        <Alert className="bg-accent border-primary">
          <AlertCircle className="h-4 w-4 !text-primary" />
                <AlertDescription>
            <strong className="text-primary">Election Status</strong>{" "}
                    Results are being updated in real-time as votes are counted.
                    Some races may be called before all precincts report.
                </AlertDescription>
            </Alert>
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 gap-6 ">
                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Voter Turnout
                                </p>
                                <p className="text-2xl font-bold">
                                    {data?.turnoutPercentage}%
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Progress
                                value={data?.turnoutPercentage}
                                className="h-2"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                {data?.votedCount} of {data?.totalVoters}{" "}
                                registered voters
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Votes Cast
                                </p>
                                <p className="text-2xl font-bold">
                                    {data?.votedCount}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Turnout Cluster
                                </p>
                                <p className="text-2xl font-bold">
                                    {data?.clusterTurnoutPercentage}%
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <Boxes className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        <Card className="border-t-8 border-t-primary">
                <CardHeader>
                    <CardTitle className="md:text-2xl text-xl">
                        Overview
                    </CardTitle>
                    <CardDescription>Unofficial Election Results</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-4">
                    {data?.positions.map((position) => {
                        return (
                          <Card key={String(position._id)} className="pt-0 shadow-lg overflow-hidden">
                            <CardHeader className="bg-primary py-2">
                              <CardTitle className="capitalize text-2xl text-primary-foreground">
                                        {position.title}
                              </CardTitle>
                            </CardHeader>
                                <CardContent className="space-y-4">
                                    {position.candidates.map((candidate,index) => {
                                        const isWinner = Boolean(
                                            position?.winners?.some(
                                                (id) =>
                                                    id?.toString() ===
                                                    candidate?._id?.toString()
                                            )
                                        )
                                        return (
                                            <Card
                                                key={String(candidate._id)}
                                            className={`${isWinner && "bg-green-100/50 border-accent outline-2 outline-green-400 outline-offset-2"} shadow-md relative`}
                                            >
                                                {isWinner && (
                                                    <CheckCircle className="text-green-700 absolute top-3 right-3" />
                                                )}
                                                <CardContent className="flex gap-2 items-center">
                                              <h1 className="text-4xl font-extrabold text-primary">{candidate.votes < 1 ? "-" : `#${index + 1}`}</h1>
                                                    <Avatar className="size-16">
                                                        <AvatarImage
                                                            src={
                                                                candidate?.image
                                                            }


                                                        />
                                                <AvatarFallback className="uppercase text-primary bg-accent text-2xl">
                                                            {candidate.name
                                                                .split(" ")
                                                                .map(
                                                                    (n) => n[0]
                                                                )
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="space-y-1.5 w-full ">

                                                <h3 className="font-light text-xl md:text-3xl text-primary p-1 capitalize">
                                                            {candidate?.name}
                                                        </h3>
                                                <p className="text-secondary-foreground">
                                                  {candidate?.bio}
                                                </p>
                                                        <div className="flex flex-col">
                                                            <div className="flex justify-between items-center w-full">
                                                                <p>
                                                                    {
                                                                        candidate?.votes
                                                                    } votes
                                                                </p>
                                                                <p className="text-muted-foreground">
                                                                    {
                                                                        candidate?.votePercentage
                                                                    }
                                                                    %
                                                                </p>{" "}
                                                      
                                                            </div>
                                                            <Progress
                                                                value={
                                                                    candidate?.votePercentage
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    )
}

export default BallotPreviewPage
