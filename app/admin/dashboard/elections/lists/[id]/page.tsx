"use client"

import { exportElectionResults } from "@/app/actions/election/export-result"
import { notifyVoters } from "@/app/actions/voters/notify-voters"
import { Candidate, ElectionDocument, Position } from "@/app/models/Election"
import AddVoters from "@/components/add-voters"
import { ErrorMessages } from "@/components/error-messages"
import Loader from "@/components/loader"
import { NumberTicker } from "@/components/magicui/number-ticker"
import SendEmail from "@/components/send-email"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { generateElectionResultsToSpreadSheet } from "@/lib/export-election"
import { format } from "date-fns"
import {
  Building2,
  Calendar,
  CheckCircle,
  Clock3,
  Download, UserRoundSearch
} from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useTransition } from "react"
import toast from "react-hot-toast"
import useSWR from "swr"

type ElectionInfo = Omit<ElectionDocument, "voters" | "positions"> & {
    votersNotified: number
    totalVoters: number
    votedCount: number
    turnoutPercentage: number
    clusterTurnoutPercentage: number
    positions: (Omit<Position, "candidates"> & {
        totalVotes: number
        candidates: (Candidate & {
            voteCount: number
            votePercentage: number
        })[]
    })[]
}

type ElectionResultInfo = Omit<ElectionDocument, "voters" | "positions"> & {
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

const statusColorIndicator: Record<string, string> = {
    Unavailable: "bg-gray-600",
    Ongoing: "bg-orange-600",
    Completed: "bg-green-600",
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

const ElectionPage = () => {
    const { id } = useParams()
    const { data, error, isLoading } = useSWR<ElectionInfo>(
        `/api/elections/${id}`,
        fetcher
    )
    const [isOngoing, startTransition] = useTransition()
    const handleSendEmailToVoters = () => {
        startTransition(async () => {
          await notifyVoters(String(id))
          toast.success(
            `Voters are now notified.`
          )
        })

    }


  if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
            <Loader />
            </div>
        )
    }
    if (error) return <ErrorMessages errors={error} />

    return (
        <div className="mt-1">
        <div className="col-span-12 flex flex-col md:flex-row gap-2 items-center justify-between ">
          <div className="flex flex-col gap-2 ">
            <h3 className="scroll-m-20 capitalize text-4xl font-semibold tracking-tight">
                        {data?.name}
                    </h3>
                    {data?.status && (
                        <Badge
                            className={`${statusColorIndicator[data?.status]}`}
                        >
                            {data?.status}
                        </Badge>
                    )}
                </div>
                <div className="space-x-2">
                    <AddVoters
                        disabled={
                            data?.status === "Ongoing" ||
                            data?.status === "Completed"
                        }
                    />
                    <SendEmail
                        isOngoing={isOngoing}
              handleConfirm={handleSendEmailToVoters}
                        electionName={data?.name}
                        variant="outline"
                        disabled={
                            data?.status === "Ongoing" ||
                            data?.status === "Completed"
                        }
                    />
                </div>
            </div>
            <div className="flex-col flex md:flex-row gap-4 mt-10">
                <div className="h-full w-full space-y-4">
                    <div className="relative h-40 w-full border  bg-secondary-foreground/5 rounded-xl overflow-hidden">
                        {data?.bannerImage ? (
                            <Image
                                src={data.bannerImage}
                                fill
                                quality={100}
                                alt={`${data?.name}-image`}
                                className="object-cover"
                                sizes="100vw"
                            />
                        ) : (
                            <Building2
                                strokeWidth={1}
                                className="w-1/2  h-40 text-muted-foreground p-4 mx-auto"
                            />
                        )}
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="md:text-2xl text-xl">
                                Election Details
                            </CardTitle>
                            <CardDescription>
                                Overview and key information about this election
                            </CardDescription>
                            <div className="flex items-center justify-between">
                                <CardTitle>Election Progress</CardTitle>{" "}
                                <p className="text-muted-foreground">
                                    {data?.turnoutPercentage}%
                                </p>
                            </div>
                            <Progress value={data?.turnoutPercentage} />
                        </CardHeader>
                        <CardContent className="grid grid-cols-2">
                            <div className="col-span-2">
                                <h3 className="text-muted-foreground font-semibold">
                                    Description
                                </h3>
                                <p className="break-all">{data?.desc}</p>
                            </div>
                            <div className="col-span-1 space-y-1.5">
                                <h3 className="text-muted-foreground font-semibold">
                                    Start Date
                                </h3>
                                <div className="flex gap-2 items-center">
                                    <Calendar className="h-5 w-5" />
                                    <p>
                                        {format(
                                            data?.startDate as Date,
                                            "MMM dd, yyyy"
                                        )}
                                    </p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Clock3 className="h-5 w-5" />
                                    <p>
                                        {format(
                                            data?.startDate as Date,
                                            "hh:mm a"
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="col-span-1 space-y-1.5">
                                <h3 className="text-muted-foreground font-semibold">
                                    End Date
                                </h3>
                                <div className="flex gap-2 items-center">
                                    <Calendar className="h-5 w-5" />
                                    <p>
                                        {format(
                                            data?.endDate as Date,
                                            "MMM dd, yyyy"
                                        )}
                                    </p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Clock3 className="h-5 w-5" />
                                    <p>
                                        {format(
                                            data?.endDate as Date,
                                            "hh:mm a"
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <Separator />
                        <CardFooter className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  disabled={data?.status !== "Completed"}
                  onClick={async () => {
                    const res = await exportElectionResults(
                      String(data?._id)
                    )
                    if (res instanceof Response) {
                      return await res.json()
                    }

                    if (res.data) {
                      generateElectionResultsToSpreadSheet(
                        res.data as ElectionResultInfo
                      )
                    }
                  }}
                >
                  <Download /> Export
                </Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="md:text-2xl text-xl">
                                Ballot Information
                            </CardTitle>
                            <CardDescription>
                                List of Positions and Candidates
                            </CardDescription>
                        </CardHeader>
                        <Separator />
                        <CardContent className="space-y-4">
                            {data?.positions.map((position) => {
                                return (
                                  <Card key={String(position._id)} className="pt-0 shadow-lg overflow-hidden">
                                    <CardHeader className="bg-blue-600/60 py-2">
                                      <CardTitle className="capitalize text-2xl text-accent">
                                        {position.title}
                                      </CardTitle>
                                      <CardDescription className="text-accent">
                                        {position.description}
                                      </CardDescription>
                                    </CardHeader>
                                        <CardContent className="space-y-4">
                                            {position.candidates.map(
                                                (candidate) => {
                                                    const isWinner = Boolean(
                                                        position?.winners?.some(
                                                            (id) =>
                                                                id?.toString() ===
                                                                candidate?._id?.toString()
                                                        )
                                                    )
                                                    return (
                                                        <Card
                                                            key={String(
                                                                candidate._id
                                                            )}
                                                            className={`${isWinner && "bg-green-100/50 outline-2 outline-green-400 outline-offset-2"} relative`}
                                                        >
                                                            {isWinner && (
                                                                <CheckCircle className="text-green-700 absolute top-3 right-3" />
                                                            )}
                                                            <CardContent className="flex gap-2 items-center">
                                                                <Avatar className="size-16">
                                                                    <AvatarImage
                                                                        src={
                                                                            candidate?.image
                                                                        }
                                                                    />
                                                                    <AvatarFallback className="uppercase text-2xl">
                                                                        {candidate.name
                                                                            .split(
                                                                                " "
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    n
                                                                                ) =>
                                                                                    n[0]
                                                                            )
                                                                            .join(
                                                                                ""
                                                                            )}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="space-y-1.5 w-full ">
                                                                    <h3 className="font-semibold text-xl md:text-2xl">
                                                                        {
                                                                            candidate?.name
                                                                        }
                                                                    </h3>
                                                                    <p className="text-muted-foreground">
                                                                        {
                                                                            candidate?.bio
                                                                        }
                                                                    </p>
                                                                    <div className="flex flex-col items-end">
                                                                        <p className="text-muted-foreground">
                                                                            {
                                                                                candidate?.voteCount
                                                                            }{" "}
                                                                            voter
                                                                            {candidate?.voteCount >
                                                                            1
                                                                                ? "s"
                                                                                : ""}
                                                                        </p>
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
                                                }
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </CardContent>
                    </Card>
                </div>
                <div className="max-h-1/2 w-full md:w-3/5 order-1  md:order-2 top-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2 ">
                                <UserRoundSearch />{" "}
                                <span>Voter Statistics</span>
                            </CardTitle>
                            <CardDescription>
                                Overview of voter participation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="col-span-1 md:col-span-2">
                                    <CardContent className="text-center">
                                        <NumberTicker
                                            className="text-4xl font-bold text-blue-500  "
                                            value={Number(data?.totalVoters)}
                                            startValue={
                                                Number(data?.totalVoters) -
                                                Number(data?.totalVoters) * 0.75
                                            }
                                        />
                                        <CardTitle className="text-muted-foreground">
                                            Total Voters{" "}
                                        </CardTitle>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="text-center">
                                        <NumberTicker
                                            className="text-4xl font-bold text-orange-500  "
                                            value={Number(data?.votersNotified)}
                                            startValue={
                                                Number(data?.votersNotified) -
                                                Number(data?.votersNotified) *
                                                    0.75
                                            }
                                        />
                                        <CardTitle className="text-muted-foreground">
                                            Notified
                                        </CardTitle>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="text-center">
                                        <NumberTicker
                                            className="text-4xl font-bold   text-green-500  "
                                            value={Number(data?.votedCount)}
                                            startValue={
                                                Number(data?.votedCount) -
                                                Number(data?.votedCount) * 0.75
                                            }
                                        />
                                        <CardTitle className="text-muted-foreground">
                                            Voted
                                        </CardTitle>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default ElectionPage
