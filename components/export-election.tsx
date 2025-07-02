"use client"

import { Candidate, ElectionDocument, Position } from "@/app/models/Election"
import { generateElectionResultsToSpreadSheet } from "@/lib/export-election"
import { AlertTriangle, Download, LoaderCircle, MoveLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { Button } from "./ui/button"


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

const ExportElectionButton = ({disabled}: {disabled?:boolean}) => {
   const { id } = useParams()
   const router = useRouter()
    const { data, error, isLoading } = useSWR<ElectionInfo>(
        `/api/elections/public/${id}/results`,
        fetcher,
        {
            revalidateOnFocus: false,
        }
    )
   if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <LoaderCircle className="animate-spin size-5" />
            </div>
        )
    }

    if (error) {
        return <div className="h-full w-full flex bg-secondary rounded-xl flex-col items-center justify-center">
             <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="size-30 p-4 text-red-600" />
          </div>
            <div className="flex flex-col gap-1 items-center mt-4">
                <p className="text-2xl text-muted-foreground font-semibold">{error.message} </p>
                <Button type="button" variant="default" size="sm" onClick={() => router.back()}><MoveLeft />Go Back</Button>
            </div>
        </div>
    }

  return (
    <Button variant="outline" disabled={disabled} onClick={() => {
      if(data) generateElectionResultsToSpreadSheet(data)
    }}><Download /> Export</Button>
  )
}

export default ExportElectionButton 