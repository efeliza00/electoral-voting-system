"use client"
import { ElectionDocument } from "@/app/models/Election"
import DeleteElectionModal from "@/components/delete-election"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
    ChevronLeft,
    ChevronRight,
    CircleHelp,
    LoaderCircle,
    SquarePen
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"

type ElectionListType = {
    nextCursor: string
    prevCursor: string
    resultsCount: number
    totalResultsCount: number
    elections: ElectionDocument[]
}

const fetcher = async (url: string) => {
    const res = await fetch(url)

    if (!res.ok) {
        const errorData = await res.json()
        const error = new Error(errorData.error || "An error occured.") as Error & { status: number }
        error.status = res.status
        throw error
    }

    return res.json()
}

const statusColorIndicator: Record<string, string> = {
    Unavailable: "bg-gray-400",
    Ongoing: "bg-yellow-500",
    Complete: "bg-green-500",
}

const ElectionListsPage = () => {
    const searchParams = useSearchParams()
    const rowsParam = searchParams.get("rows") || "10"
    const pageParam = searchParams.get("page") || "1"
    const router = useRouter()
    const { data, error, isLoading } = useSWR<ElectionListType>(
        `/api/elections?rows=${rowsParam}&page=${pageParam}`,
        fetcher, {
        shouldRetryOnError: false
    }
    )

    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <LoaderCircle className="animate-spin size-10" />
            </div>
        )
    }

    if (error) {
        return <div className="h-full w-full flex bg-secondary rounded-xl flex-col items-center justify-center">
            <CircleHelp className=" size-40" />
            <div className="flex gap-1 items-center">
                <p className="text-2xl text-muted-foreground font-semibold">{String(error)} </p>
                <Button variant="link" size="sm" className="text-2xl" onClick={() => router.back()}>Go Back</Button>
            </div>
            <p className="text-muted-foreground">Please check the values and Try again.</p>
        </div>
    }

    return (
        <>
            <Table className="border">
                <TableHeader className="bg-secondary">
                    <TableRow>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="w-[200px]">Title</TableHead>
                        <TableHead className="w-[300px]">Description</TableHead>
                        <TableHead className="w-[150px]">Start Date</TableHead>
                        <TableHead className="w-[100px] text-right">Voters</TableHead>
                        <TableHead className="w-[180px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.elections?.length ? (
                        data.elections.map((election) => (
                            <TableRow
                                key={String(election._id)}
                                className="hover:bg-secondary/50 cursor-pointer transition-colors"
                                onClick={() => router.push(`/dashboard/elections/lists/${election._id}`)}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                "w-2 h-2 rounded-full",
                                                statusColorIndicator[election.status] ?? "bg-gray-300"
                                            )}
                                        />
                                        <span className="capitalize">{election.status}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium truncate max-w-[200px]">
                                    {election.name}
                                </TableCell>
                                <TableCell className="truncate max-w-[300px]">
                                    {election.desc || "No description"}
                                </TableCell>
                                <TableCell>
                                    {election.startDate
                                        ? format(new Date(election.startDate), "MMM dd, yyyy")
                                        : "Not set"}
                                </TableCell>
                                <TableCell className="text-right">
                                    {election.voters?.length || 0}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/dashboard/elections/lists/edit/${election._id}`);
                                            }}
                                        >
                                            <SquarePen className="h-3.5 w-3.5" />
                                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                                Edit
                                            </span>
                                        </Button>
                                        <DeleteElectionModal
                                            id={election._id}
                                            name={election.name}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No elections found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
                <div className="flex gap-1 items-center">
                    <span className="text-muted-foreground text-sm">
                        Rows per page
                    </span>
                    <Select
                        value={rowsParam}
                        onValueChange={(value) => {
                            router.push(`?rows=${value}&page=1`)
                        }}
                    >
                        <SelectTrigger className="w-[65px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {["10", "20", "30", "40", "50"].map((row) => (
                                <SelectItem key={row} value={row}>
                                    {row}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-muted-foreground text-sm">
                        {data?.resultsCount} of {data?.totalResultsCount} results
                    </span>
                    <div className="space-x-2">
                        <Button
                            size="icon"
                            variant="outline"
                            disabled={Number(pageParam) <= 1}
                            onClick={() => router.push(`?rows=${rowsParam}&page=${Number(pageParam) - 1}`)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="outline"
                            disabled={
                                Number(pageParam) * Number(rowsParam) >=
                                Number(data?.totalResultsCount || 0)
                            }
                            onClick={() => router.push(`?rows=${rowsParam}&page=${Number(pageParam) + 1}`)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ElectionListsPage