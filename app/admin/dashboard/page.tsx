"use client"
import { ElectionDocument } from "@/app/models/Election"
import { ErrorMessages } from "@/components/error-messages"
import EventCalendar from "@/components/event-calendar"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { LoaderCircle } from "lucide-react"
import useSWR from "swr"

type DashboardOverview = {
    totalElections: number
    ongoingElections: number
    totalVoters: number
    votesCast: number
    totalVoterTurnout: number
}

type EventElections = Pick<ElectionDocument, "_id" | "status" | "name" | "startDate" | "endDate" | "desc">

const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.")
        error.message = await res.json()

        throw error
    }
    return res.json()
}

const DashboardPage = () => {
    const {
        data: overview,
        isLoading: isOverviewLoading,
        error: eventOverviewError,
    } = useSWR<DashboardOverview>("/api/elections/overview", fetcher)
     const {
        data: eventElections ,
        isLoading: isEventElectionLoading ,
        error: eventElectionError ,
    } = useSWR<EventElections[]>("/api/elections/schedule", fetcher)

   

    if (isOverviewLoading)
        return (
            <div className="h-full w-full flex items-center justify-center">
                <LoaderCircle className="animate-spin size-10" />
            </div>
        )
    if (eventOverviewError || eventOverviewError) return <ErrorMessages errors={eventOverviewError || eventElectionError} />

    return (
        <div className="space-y-4 ">
            <div className="border-b pb-1">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    Dashboard
                </h3>
                <p className="leading-7 text-muted-foreground">
                    Overview of election and statistics.
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                <Card className="col-span-1 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                    <CardContent className="text-center">
                        <NumberTicker
                            className="text-4xl font-bold text-blue-500"
                            value={Number(overview?.totalElections)}
                            startValue={
                                Number(overview?.totalElections) -
                                Number(overview?.totalElections) * 0.75
                            }
                        />
                        <CardTitle className="text-muted-foreground">
                            Total Elections
                        </CardTitle>
                    </CardContent>
                </Card>
                <Card className="col-span-1  hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                    <CardContent className="text-center">
                        <NumberTicker
                            className="text-4xl font-bold text-orange-500  "
                            value={Number(overview?.totalVoters)}
                            startValue={
                                Number(overview?.totalVoters) -
                                Number(overview?.totalVoters) * 0.75
                            }
                        />
                        <CardTitle className="text-muted-foreground">
                            Total Registered Voters{" "}
                        </CardTitle>
                    </CardContent>
                </Card>
                <Card className="col-span-1  hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                    <CardContent className="text-center">
                        <NumberTicker
                            className="text-4xl font-bold text-green-500  "
                            value={Number(overview?.ongoingElections)}
                            startValue={
                                Number(overview?.ongoingElections) -
                                Number(overview?.ongoingElections) * 0.75
                            }
                        />
                        <CardTitle className="text-muted-foreground">
                            Active Elections{" "}
                        </CardTitle>
                    </CardContent>
                </Card>
                <Card className="col-span-1  hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                    <CardContent className="text-center">
                        <NumberTicker
                            className="text-4xl font-bold text-orange-600  "
                            value={Number(overview?.votesCast)}
                            startValue={
                                Number(overview?.votesCast) -
                                Number(overview?.votesCast) * 0.75
                            }
                        />
                        <CardTitle className="text-muted-foreground">
                            Vote Casts
                        </CardTitle>
                    </CardContent>
                </Card>
                <Card className="col-span-1  hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                    <CardContent className="text-center">
                        <span className="text-4xl font-bold text-purple-500">
                            <NumberTicker
                                className="text-purple-500"
                                value={Number(overview?.totalVoterTurnout)}
                                startValue={
                                    Number(overview?.totalVoterTurnout) -
                                    Number(overview?.totalVoterTurnout) * 0.75
                                }
                            />
                            %
                        </span>
                        <CardTitle className="text-muted-foreground">
                            Overall Voter Turnout
                        </CardTitle>
                    </CardContent>
                </Card>
            </div>
            {isEventElectionLoading ? <div className="h-full w-full flex items-center justify-center">
                <LoaderCircle className="animate-spin size-10" />
            </div>:<EventCalendar events={eventElections}/>}
        </div>
    )
}

export default DashboardPage
