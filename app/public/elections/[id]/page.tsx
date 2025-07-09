"use client"
import { use } from "react"

import { Candidate, ElectionDocument } from "@/app/models/Election"
import { ErrorMessages } from "@/components/error-messages"
import Loader from "@/components/loader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import {
  Building2,
  CalendarDays,
  Clock3, Trophy
} from "lucide-react"
import Image from "next/image"
import useSWR from "swr"

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

const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
    <Card className="h-full">
        <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={candidate.image} alt={candidate.name} />
                    <AvatarFallback className="text-lg uppercase">
                        {candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <CardTitle className="text-xl capitalize">
                        {candidate.name}
                    </CardTitle>
                    <CardDescription>{candidate.bio}</CardDescription>
                </div>
            </div>
        </CardContent>
    </Card>
)

const PublicElectionPage = (props: { params: Promise<{ id: string }> }) => {
    const params = use(props.params)
    const { data, error, isLoading } = useSWR<Omit<ElectionDocument, "voters">>(
        `/api/elections/public/${params.id}`,
        fetcher,
        {
            refreshInterval: 60 * 1000,
            revalidateOnFocus: false,
        }
    )
    if (isLoading)
        return (
            <div className="h-full w-full flex items-center justify-center">
            <Loader />
            </div>
        )
    if (error) return <ErrorMessages errors={error} />

    return (
        <div className="flex flex-col gap-4 min-h-full w-full">
            <div className="relative h-72 w-full  bg-secondary-foreground/3 rounded-xl drop-shadow-xl overflow-hidden">
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
                        className="w-1/2 h-72 text-muted-foreground mx-auto"
                    />
                )}
            </div>
            <div className="col-span-12 flex items-center justify-center ">
                <div className="space-y-2">
                    <h1 className="scroll-m-20 text-xl md:text-3xl text-center uppercase font-semibold tracking-tight">
                        {data?.name} Information
                    </h1>
                    <p className="leading-7 md:text-2xl text-xl text-center text-muted-foreground">
                        {data?.desc}
                    </p>
                    <p className="text-muted-foreground text-center flex items-center justify-center gap-2 ">
                        <span>
                            <CalendarDays className="h-5 w-5 inline-block items-center gap-2" />{" "}
                            Election Date:{" "}
                            {format(data?.startDate as Date, "LLL dd, y")}{" "}
                        </span>
                        <span>
                            <Clock3 className="h-5 w-5 inline-block gap-2" />{" "}
                            Starts on{" "}
                            {format(data?.startDate as Date, "hh:mm a")}
                        </span>
                    </p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Ballot Information</CardTitle>
                    <CardDescription>
                        Details of Position and Candidates
                    </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-4">
                    {data?.positions.map((position) => (
                        <Card key={String(position._id)}>
                            <CardHeader>
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle className="capitalize">
                                        <span>{position.title}</span>
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-yellow-300/20 p-1 rounded-full">
                                            <Trophy className="text-yellow-600 h-3 w-3" />
                                        </div>
                                        <span className="text-muted-foreground font-semibold">
                                            Number of winners:{" "}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {position.numberOfWinners}
                                        </span>
                                    </div>
                                </div>
                                <CardDescription>
                                    {position.description}
                                </CardDescription>
                            </CardHeader>
                            <Separator />
                            <CardContent className="space-y-2">
                                {position.candidates.length === 0 && (
                                    <span className="text-center mt-4 text-muted-foreground">
                                        No candidates available.
                                    </span>
                                )}
                                {position.candidates.map((candidate) => (
                                    <CandidateCard
                                        key={String(candidate._id)}
                                        candidate={candidate}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

export default PublicElectionPage
