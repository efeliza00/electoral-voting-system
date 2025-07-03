"use client"
import { Candidate, ElectionDocument, Position } from "@/app/models/Election"
import { ErrorMessages } from "@/components/error-messages"
import ExportElectionButton from "@/components/export-election"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Boxes,
  Building2,
  CalendarCheck2,
  CalendarDays,
  ClockArrowUp, LoaderCircle,
  TrendingUp,
  Trophy,
  Users
} from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import useSWR from "swr"
type ElectionInfo = Omit<ElectionDocument, "voters" | "positions"> & {
    totalVoters: number
    votedCount: number
    turnoutPercentage: number
    clusterTurnoutPercentage: number
    positions: (Omit<Position, "candidates" | "winners"> & {
        totalVotes: number
        candidates: (Candidate & {
            votes: number
            votePercentage: number
        })[]
        winners: (Candidate & {
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

const BallotResultsPage = () => {
    const { id } = useParams()
    const { data, error, isLoading } = useSWR<ElectionInfo>(
        `/api/elections/public/${id}/results`,
        fetcher,
        {
            revalidateOnFocus: false,
        }
    )

    if (isLoading)
        return (
            <div className="h-full w-full flex items-center justify-center">
                <LoaderCircle className="animate-spin size-10" />
            </div>
        )
    if (error) return <ErrorMessages errors={error} />

    return (
        <div className="w-full space-y-4  ">
            <div className="col-span-12 relative h-40 w-full group bg-secondary-foreground/3 rounded-xl overflow-hidden">
                {data?.bannerImage ? (
                    <Image
                        src={data.bannerImage}
                        fill
                        alt={`${data.name} banner`}
                        className="object-cover"
                    />
                ) : (
                    <Building2 className="w-1/2 h-40 mx-auto text-muted-foreground" />
                )}

                <div
                    className="absolute inset-0 opacity-50  
                  bg-gradient-to-t from-primary/70 via-primary/40 to-transparent
                 "
                />

                <h1 className="z-10 absolute bottom-2 left-2 text-3xl font-semibold text-accent capitalize">
                    {data?.name} - Results
                </h1>
            </div>
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        {" "}
                        <div className="flex gap-2 items-center text-muted-foreground">
                            <CalendarDays className="h-5 w-5 " />
                            <span>
                                {format(
                                    data?.startDate as Date,
                                    "MMM dd, yyy 'at' hh:mm a"
                                )}
                            </span>
                        </div>
                        <div className="flex gap-2 items-center text-muted-foreground">
                            <CalendarCheck2 className="h-5 w-5 " />
                            <span>
                                {format(
                                    data?.endDate as Date,
                                    "MMM dd, yyy 'at' hh:mm a"
                                )}
                            </span>
                        </div>
                    </div>
                    <p className="flex gap-2 items-center text-muted-foreground ">
                        <ClockArrowUp className="h-5 w-5" />{" "}
                        <span>
                            Last updated:{" "}
                            {format(
                                data?.updatedAt as Date,
                                "MMM dd, yyy 'at' hh:mm a"
                            )}
                        </span>
                    </p>
                </div>
                <div>
                    <ExportElectionButton/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
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
            <Card>
                <CardHeader>
                    <CardTitle className="md:text-2xl text-xl flex items-center gap-2 ">
                        <Trophy className="text-yellow-600" /> Election Summary
                    </CardTitle>
                    <CardDescription>
                        Final results and key statistics.
                    </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent>
                    {data?.positions.map((position) => {
                        if (position.winners.length === 0) {
                            return null
                        }
                        return (
                            <Card
                                key={String(position._id)}
                                className="border-green-400 bg-green-200/20"
                            >
                                <CardContent>
                                    {position.winners?.map((winner) => {
                                        return (
                                            <div
                                                key={winner._id.toLocaleString()}
                                                className="flex gap-2 items-center"
                                            >
                                                <Avatar className="size-16">
                                                    <AvatarImage
                                                        src={winner?.image}
                                                    />
                                                    <AvatarFallback className="uppercase text-2xl">
                                                        {winner.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="w-full">
                                                    <h3 className="font-semibold text-xl md:text-2xl capitalize flex items-center gap-2">
                                                        {winner?.name}
                                                        <div className="h-6 w-6 p-1.5 rounded-full bg-yellow-300/20 flex items-center justify-center">
                                                            <Trophy className="h-4 w-4 text-yellow-600" />
                                                        </div>
                                                    </h3>

                                                    <div className="flex justify-between items-center">
                                                        <p className="text-muted-foreground text-xl capitalize">
                                                            {position.title}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <p>
                                                                {winner?.votes}{" "}
                                                                votes
                                                            </p>
                                                            <p className="text-muted-foreground">
                                                                (
                                                                {
                                                                    winner?.votePercentage
                                                                }
                                                                %)
                                                            </p>{" "}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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

export default BallotResultsPage
