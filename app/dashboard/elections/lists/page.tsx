"use client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import useSWR from "swr"

import { ElectionDocument } from "@/app/models/Election"
import { ErrorMessages } from "@/components/error-messages"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const ElectionListsPage = () => {
    const router = useRouter()
    const { data, error, isLoading } = useSWR<ElectionDocument[]>(
        `/api/elections`,
        fetcher
    )

    if (isLoading)
        return (
            <div className="h-full w-full flex items-center justify-center">
                <LoaderCircle className="animate-spin size-10" />
            </div>
        )
    if (error) return <ErrorMessages errors={error} />
    return (
        <>
            <Table className="border">
                <TableHeader className="bg-secondary">
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Voters </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.map((election, index) => (
                        <TableRow
                            key={index}
                            className="cursor-pointer"
                            onClick={() =>
                                router.push(
                                    `/dashboard/elections/lists/${election._id}`
                                )
                            }
                        >
                            <TableCell className="font-medium">
                                Not Available
                            </TableCell>
                            <TableCell>{election.name}</TableCell>
                            <TableCell>{election.desc}</TableCell>
                            <TableCell className="text-right">
                                {election.voters.length}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex items-center justify-between">
                <div className="flex gap-1 items-center">
                    <span className="text-muted-foreground text-sm ">
                        No of Rows
                    </span>
                    <Select>
                        <SelectTrigger className="w-[65px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {["10", "20", "30", "40", "50"].map(
                                (row, index) => {
                                    return (
                                        <SelectItem key={index} value={row}>
                                            {row}
                                        </SelectItem>
                                    )
                                }
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <span className="text-muted-foreground text-xs">
                    {data?.length} of 100 Results found.
                </span>
            </div>
        </>
    )
}

export default ElectionListsPage
