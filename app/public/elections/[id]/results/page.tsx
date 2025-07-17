"use client"
import { Candidate, ElectionDocument, Position } from "@/app/models/Election"
import { ErrorMessages } from "@/components/error-messages"
import Loader from "@/components/loader"
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
import { format } from "date-fns"
import {
  Boxes,
  Building2,
  CalendarCheck2,
  CalendarDays,
  ClockArrowUp, TrendingUp,
  Trophy,
  Users
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
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
          <div className="min-h-screen w-full flex items-center justify-center">
            <Loader />
            </div>
        )
    if (error) return <ErrorMessages errors={error} />

    return (
      <div className="w-full space-y-4 my-26 ">
        <div className="col-span-12 relative h-48 w-full group border border-accent flex items-center justify-center rounded-xl overflow-hidden">
                {data?.bannerImage ? (
                    <Image
                        src={data.bannerImage}
                        fill
                        alt={`${data.name} banner`}
                        className="object-cover"
                    />
                ) : (
              <Building2 className="w-1/2 h-30  text-accent" />
                )}


        </div>
        <h1 className="text-primary-foreground bg-primary bg-gradient-to-r from-primary to-purple-700 text-center p-4 text-5xl shadow">
          Results
        </h1>
        <h1 className="text-5xl font-light text-primary capitalize">
          {data?.name}
        </h1>
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
            </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ">
                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                  <p className="text-sm font-medium text-secondary-foreground">
                                    Voter Turnout
                                </p>
                  <p className="text-2xl text-primary font-bold">
                                    {data?.turnoutPercentage}%
                                </p>
                            </div>
                <div className="h-12 w-12 rounded-full  shadow bg-blue-100 flex items-center justify-center">
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
                  <p className="text-sm font-medium text-secondary-foreground">
                                    Total Votes Cast
                                </p>
                  <p className="text-2xl text-primary font-bold">
                                    {data?.votedCount}
                                </p>
                            </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center  shadow justify-center">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                  <p className="text-sm font-medium text-secondary-foreground">
                                    Turnout Cluster
                                </p>
                  <p className="text-2xl text-primary font-bold">
                                    {data?.clusterTurnoutPercentage}%
                                </p>
                            </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center  shadow justify-center">
                                <Boxes className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        <Card className=" pt-0 ">
          <CardHeader className="flex-row bg-accent text-primary p-4">
            <CardTitle className="md:text-3xl font-light text-xl flex items-center gap-2 ">
              Election Summary
                    </CardTitle>
            <CardDescription className="text-muted-foreground">
                        Final results and key statistics.
                    </CardDescription>
                </CardHeader>
          <CardContent className="space-y-4">
                    {data?.positions.map((position) => {
                        if (position.winners.length === 0) {
                            return null
                        }
                        return (
                            <Card
                                key={String(position._id)}
                            className="border-accent  to-slate-50"
                            >
                                <CardContent>
                                    {position.winners?.map((winner) => {
                                        return (
                                            <div
                                                key={winner._id.toLocaleString()}
                                                className="flex gap-2 items-center"
                                          >  <Trophy className="h-10 w-10 text-yellow-600" />
                                                <Avatar className="size-16">
                                                    <AvatarImage
                                                        src={winner?.image}
                                                    />
                                              <AvatarFallback className="uppercase text-primary bg-accent text-2xl">
                                                        {winner.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="w-full">
                                              <p className="text-primary-foreground p-1 bg-gradient-to-r from-primary to-primary-foreground text-lg capitalize">
                                                {position.title}
                                              </p>
                                              <h3 className="font-medium text-xl md:text-3xl capitalize flex items-center gap-2 line-clamp-2">

                                                        {winner?.name}

                                                    </h3>

                                              <div>

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
            {data?.status === "Ongoing" && <div className="flex items-center justify-center">
              <h1 className="text-muted-foreground italic">Currently, there are no winners. This election may still be in progress. <Button className="hover:text-green-600 px-0" variant="link" asChild><Link href={`/public/elections/${String(data?._id)}/preview`}>Click to preview this Election.</Link></Button></h1>
            </div>}
                </CardContent>
            </Card>
        </div>
    )
}

export default BallotResultsPage
