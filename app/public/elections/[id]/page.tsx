"use client"
import { use } from "react"

import { Candidate, ElectionDocument } from "@/app/models/Election"
import { ErrorMessages } from "@/components/error-messages"
import Loader from "@/components/loader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
  Clock3
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
          <AvatarFallback className="text-lg uppercase bg-accent text-primary">
                        {candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </AvatarFallback>
                </Avatar>
        <div className="flex-1 leading-tight">
          <h1 className="text-2xl text-primary capitalize">
                        {candidate.name}
          </h1>
          <p className="text-muted-foreground">{candidate.bio}</p>
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
          <div className="min-h-screen w-full flex items-center justify-center">
            <Loader />
            </div>
        )
    if (error) return <ErrorMessages errors={error} />

    return (
      <div className="flex flex-col my-26 gap-4 min-h-full w-full">
        <div className="relative h-72 w-full  border-accent border flex items-center justify-center rounded-lg  overflow-hidden">
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

                className="w-1/2 h-48 m-auto text-accent "
                    />
                )}
            </div>
        <h1 className="text-primary-foreground bg-primary bg-gradient-to-r from-primary to-purple-700 text-center p-4 text-5xl shadow">
          Information
        </h1>
            <div className="col-span-12 flex items-center justify-center ">
                <div className="space-y-2">
            <h1 className="scroll-m-20 text-xl md:text-5xl text-center uppercase font-light tracking-tight">
              {data?.name}
                    </h1>
                    <p className="leading-7 md:text-2xl text-xl text-center text-muted-foreground">
                        {data?.desc}
                    </p>
            <div className="text-muted-foreground text-center flex items-center justify-center gap-2 ">
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
            </div>
                </div>
            </div>
            <Card>
                <CardHeader>
            <CardTitle className="text-3xl font-light">Ballot Information</CardTitle>
                    <CardDescription>
                        Details of Position and Candidates
                    </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-4">
                    {data?.positions.map((position) => (
                      <Card key={String(position._id)} className="pt-0 overflow-hidden">
                        <CardHeader className="bg-primary text-primary-foreground p-4">
                                <div className="flex items-center justify-between gap-2">
                            <CardTitle className="capitalize text-2xl md:text-xl">
                                        <span>{position.title}</span>
                                    </CardTitle>
                            <Badge variant="secondary">
                              <span className="text-muted-foreground font-light">
                                            Number of winners:{" "}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {position.numberOfWinners}
                                        </span>
                            </Badge>
                                </div>
                                <CardDescription>
                                    {position.description}
                                </CardDescription>
                            </CardHeader>

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
