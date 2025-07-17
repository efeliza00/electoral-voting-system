"use client"
import { ElectionDocument } from "@/app/models/Election"
import CountdownTimer from "@/components/countdown-timer"
import Loader from "@/components/loader"
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
import { format } from "date-fns"
import {
  AlertTriangle,
  CalendarArrowUp,
  CalendarCheck,
  CalendarDays,
  Eye,
  LayoutList,
  List,
  ListTodo,
  MoveLeft, Presentation,
  ReceiptText
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import useSWR from "swr"
type Election = ElectionDocument & {
    totalVoters: number
    votedCount: number
    turnoutPercentage: number
    updatedAt: Date
}

type Elections = {
    ongoingElections: Election[]
    upComingElections: Election[]
    otherElections: Election[]
}

type ErrorType = {
    message: string
}

const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.")
        error.message = await res.json()

        throw error
    }
    return res.json()
}

const statusColorIndicator: Record<string, string> = {
    Unavailable: "bg-gray-600",
    Ongoing: "bg-orange-600",
    Completed: "bg-green-600",
}


const OngoingElectionCard = ({ election }: { election: Election }) => {
    const router = useRouter()
    return (
        <Card
        className={`h-full w-full hover:shadow-lg  duration-300  overflow-hidden  `}
        >
        {election.bannerImage && (
          <div className="relative w-full h-40 -mt-10">
            <Image
              src={election.bannerImage || "/placeholder.svg"}
              alt={`${election.name} banner`}
              fill
              className="object-cover"
            />
          </div>
        )}
            <CardHeader>
                <CardTitle
            className={` text-xl/1 capitalize flex items-center gap-2 flex-wrap break-normal`}
                >
                    {election.name}{" "}
                    <Badge
                        className={`${statusColorIndicator[election.status]}`}
                    >
                        {election.status}
                    </Badge>
                </CardTitle>
                <CardDescription>{election.desc}</CardDescription>
            </CardHeader>
            <CardContent
          className={`space-y-4 flex-1`}
            >
                <div className="flex items-center gap-2 text-sm">
                    <div className="flex-shrink-0">
                        <CalendarCheck className="h-5 w-5" />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2">
                        <span className="whitespace-nowrap">
                            {`Election ${new Date() > new Date(election.endDate) ? "ended" : "ends"} on`}
                        </span>
                        <span className="whitespace-nowrap font-semibold">
                            {format(new Date(election.endDate), "MMM dd, yyyy")}
                        </span>
                        <span className="whitespace-nowrap">at</span>
                        <span className="whitespace-nowrap font-semibold">
                            {format(new Date(election.endDate), "hh:mm a")}
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                    <CountdownTimer date={election.endDate} />
                </div>
                <div className="space-y-1.5">
                    <div className="flex gap-2 items-center justify-between">
                        <p className="font-semibold tracking-wide">
                            Overall Progress
                        </p>
                        <p>{election.turnoutPercentage} %</p>
                    </div>
            <Progress value={election.turnoutPercentage} />
                    <p>
                        {election.votedCount} out of {election.totalVoters} have
                        voted.
                    </p>
                </div>
            </CardContent>
        <Separator />
            <CardFooter className=" gap-2 ">
                <Button
                    type="button"
                    onClick={() =>
                        router.push(`/public/elections/${election._id}/ballot`)
                    }
                    className="w-1/2"
                >
                    <ListTodo />
                    <span>Cast a Vote</span>
                </Button>
          <Button
            type="button"
            variant="outline"
            className="w-1/2"
            onClick={() =>
              router.push(`/public/elections/${election._id}/preview`)
            }
          >
                    <Eye /> <span>Preview Polls</span>{" "}
                </Button>
            </CardFooter>
        </Card>
    )
}

const OtherElectionCard = ({ election }: { election: Election }) => {
  const router = useRouter()
    return (
        <Card
        className={`h-full flex flex-col  hover:shadow-lg hover:bg-neutral-50 duration-300 overflow-hidden`}
        >
            {election.bannerImage && (
                <div className="relative w-full aspect-video -mt-10">
                    <Image
                        src={election.bannerImage || "/placeholder.svg"}
                        alt={`${election.name} banner`}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            <CardHeader>
                <CardTitle
            className={` text-xl/5 capitalize flex items-center gap-2 flex-wrap`}
                >
                    <span className="line-clamp-1">{election.name}</span>
                    <Badge
                        className={`${statusColorIndicator[election.status]} shrink-0`}
                    >
                        {election.status}
                    </Badge>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                    {election.desc}
                </CardDescription>
            </CardHeader>

        <CardContent
          className={`flex-1 space-y-4`}
        >
                <div className="flex items-start gap-3 text-sm">
                    <CalendarDays className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                        <span className="text-muted-foreground">
                            {`Election ${new Date() > new Date(election.startDate) ? "started" : "starts"}`}
                        </span>
                        <span className="font-medium">
                {format(
                  new Date(election.startDate),
                  "MMM dd, yyyy 'at' hh:mm a"
                )}
                        </span>
                    </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                    <CalendarCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                        <span className="text-muted-foreground">
                            {`Election ${new Date() > new Date(election.endDate) ? "ended" : "ends"}`}
                        </span>
                        <span className="font-medium">
                {format(
                  new Date(election.endDate),
                  "MMM dd, yyyy 'at' hh:mm a"
                )}
                        </span>
                    </div>
                </div>

                {election.status !== "Unavailable" && (
                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-medium">Voter Turnout</p>
                            <p className="text-sm font-semibold">
                                {election.turnoutPercentage}%
                            </p>
                        </div>
                        <Progress
                indicatorClassName={
                  statusColorIndicator[election.status]
                }
                            value={election.turnoutPercentage}
                        />
                        <p className="text-sm text-muted-foreground">
                {election.votedCount} of {election.totalVoters}{" "}
                voted
                        </p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="mt-auto">
                {election.status !== "Unavailable" && (
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={() =>
                router.push(
                  `/public/elections/${election._id}/results`
                )
              }
            >
                        <ReceiptText className="mr-2 h-4 w-4" />
                        View Results
                    </Button>
                )}
            </CardFooter>
        </Card>
  )
}
const UpcomingElectionCard = ({ election }: { election: Election }) => {
    const router = useRouter()
    return (
        <Card
        className={`h-full hover:outline-1 outline-offset-2 transition-all duration-300 ease-in-out `}
            onClick={() =>
                router.push(`/public/elections/${String(election._id)}`)
            }
        >
        <CardHeader>
          <Badge
            className={`${statusColorIndicator[election.status]}`}
          >
                    {election.status}
                </Badge>
          <CardTitle
            className={`capitalize text-xl/5`}
                >
                    {election.name}
          </CardTitle>
                <CardDescription>{election.desc}</CardDescription>
            </CardHeader>
        <Separator />
            <CardContent
          className={`space-y-4`}
            >
                <div className="flex items-center gap-2 text-sm">
                    <div className="flex-shrink-0">
                        <CalendarDays className="h-5 w-5" />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2">
              <span className="whitespace-nowrap">{`Starts on`}</span>
                        <span className="whitespace-nowrap font-semibold">
                            {format(
                                new Date(election.startDate),
                                "MMM dd, yyyy"
                            )}
                        </span>
                        <span className="whitespace-nowrap">at</span>
                        <span className="whitespace-nowrap font-semibold">
                            {format(new Date(election.startDate), "hh:mm a")}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const ElectionPage = () => {
    const router = useRouter()
    const { data, error, isLoading } = useSWR<Elections, ErrorType>(
        `/api/elections/public`,
        fetcher,
        {
            refreshInterval: 60 * 1000,
            revalidateOnFocus: false,
        }
    )

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
            <Loader />
            </div>
        )
    }
    if (error) {
        return (
            <div className="h-full w-full flex bg-secondary rounded-xl flex-col items-center justify-center">
                <div className="rounded-full bg-red-100 p-4">
                    <AlertTriangle className="size-30 p-4 text-red-600" />
                </div>
                <div className="flex flex-col gap-1 items-center mt-4">
                    <p className="text-2xl text-muted-foreground font-semibold">
                        {error.message}{" "}
                    </p>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => router.back()}
                    >
                        <MoveLeft />
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    return (
      <div className="container max-w-full my-26 md:max-w-9/12 p-4 md:p-0 mx-auto min-h-screen ">
        <div className="w-full flex items-center gap-4 ">
          <div className="bg-accent rounded-xl shadow-lg p-3">

            <Presentation className="h-14 w-14 text-primary " />
          </div>
                <div className="space-y-1.5">
            <h1 className="font-bold text-primary text-2xl/7 md:text-5xl/7 ">
              Elections Bulletin
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-lg">
              Track Ongoing and Upcoming elections
                    </p>
                </div>
            </div>
            <div className="flex-col flex md:flex-row gap-4 mt-10">
          <div className="h-full w-full space-y-4">
            <Card className="h-full w-full border-accent border-t-8 border-t-orange-600/35">
              <CardHeader >
                <CardTitle className="text-2xl font-light text-accent-foreground md:text-3xl">
                  Ongoing Elections
                </CardTitle>

                        </CardHeader>
              <Separator className="bg-accent" />
              <CardContent className="grid grid-cols-1 md:grid-cols-2 w-full items-stretch gap-4">
                            {data?.ongoingElections?.length &&
                            data.ongoingElections.length > 0 ? (
                                data.ongoingElections.map((election) => (
                                    <OngoingElectionCard
                                        key={String(election._id)}
                                        election={election}
                                    />
                                ))
                            ) : (
                    <div className="w-full col-span-full flex flex-col items-center justify-between p-16 gap-2 drop-shadow-xs rounded-md">
                      <div className="p-2 bg-secondary rounded-xl">
                        <LayoutList
                                            strokeWidth={1}
                          className="size-10 text-secondary-foreground  "
                                        />
                                    </div>
                      <span className="text-secondary-foreground capitalize">
                        No Ongoing Elections available.
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
            <Card className="h-full w-full border-accent border-t-8 border-t-accent">
                        <CardHeader className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-accent shadow-lg">
                  {" "}
                  <List className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl md:text-3xl font-light text-accent-foreground">
                                More Elections
                </CardTitle>
                        </CardHeader>
              <Separator className="bg-accent" />
              <CardContent className="grid grid-cols-1 md:grid-cols-2  gap-4">
                            {data?.otherElections?.length &&
                            data.otherElections.length > 0 ? (
                                data.otherElections.map((election) => (
                                    <OtherElectionCard
                                        key={String(election._id)}
                                        election={election}
                                    />
                                ))
                            ) : (
                    <div className="w-full  flex flex-col col-span-full items-center justify-between p-16 gap-2 drop-shadow-xs rounded-md">
                      <div className="p-2 bg-secondary rounded-xl">
                        <LayoutList
                                            strokeWidth={1}
                          className="size-10 text-secondary-foreground  "
                                        />
                                    </div>
                      <span className="text-secondary-foreground capitalize">
                        No Elections available.
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="max-h-1/2 w-full md:w-3/5 order-1  md:order-2 top-4">
            <Card className="h-max-full w-full border-t-8 border-accent border-t-primary">
                        <CardHeader className="flex items-center bg-neutral">
                <div className="p-3 rounded-xl bg-accent shadow-md">
                  <CalendarArrowUp className="size-6 text-primary" />
                </div>

                <CardTitle className="text-2xl font-light text-accent-foreground">
                                Upcoming Elections
                </CardTitle>
                        </CardHeader>
              <Separator className="bg-accent" />
                        <CardContent className="grid grid-cols-1 gap-4 ">
                            {data?.upComingElections?.length &&
                            data.upComingElections.length > 0 ? (
                                data.upComingElections.map((election) => (
                                    <UpcomingElectionCard
                                        key={String(election._id)}
                                        election={election}
                                    />
                                ))
                            ) : (
                    <div className="w-full  flex flex-col items-center justify-between gap-2 drop-shadow-xs rounded-md">
                      <div className="p-2 bg-secondary rounded-xl">
                        <LayoutList
                                            strokeWidth={1}
                          className="size-10 text-secondary-foreground  "
                                        />
                                    </div>
                      <span className="text-secondary-foreground capitalize">
                                        No Upcoming Elections available.
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default ElectionPage
