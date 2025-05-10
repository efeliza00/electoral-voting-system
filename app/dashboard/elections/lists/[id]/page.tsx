"use client"

import { ElectionDocument } from "@/app/models/Election"
import { ErrorMessages } from "@/components/error-messages"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { LoaderCircle } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const ElectionPage = () => {
    const pathname = usePathname()
    const { data, error, isLoading } = useSWR<ElectionDocument>(
        `/api/elections/${pathname.split("/").pop()}`,
        fetcher
    )
    if (isLoading)
        return (
            <div className="h-full w-full flex items-center justify-center">
                <LoaderCircle className="animate-spin size-10" />
            </div>
        )
    if (error) return <ErrorMessages errors={error} />
    console.log(data)
    return (
        <div className="border p-4 bg-secondary/20 h-full w-full">
            <div className="grid grid-cols-12 gap-1">
                <div className="col-span-12  w-full border object-contain bg-secondary-foreground/3 rounded-t-xl ">
                    {data?.bannerImage ? (
                        <Image
                            src={data?.bannerImage}
                            height={200}
                            quality={100}
                            width={200}
                            alt={`${data?.name}-image`}
                            className="mx-auto bg-secondary"
                        />
                    ) : (
                        <Image
                            src={"/images/no-image.png"}
                            height={200}
                            quality={100}
                            width={200}
                            alt={`${data?.name}-image`}
                            className="mx-auto bg-transparent"
                        />
                    )}
                </div>
                <div className="col-span-12 mt-5 border-b">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        {data?.name}
                    </h3>
                    <p className="leading-7 text-muted-foreground">
                        {data?.desc}
                    </p>
                </div>
                <div className="col-span-6 inline-block mt-5">
                    <Label>Start Date</Label>
                    <p>{format(data?.startDate as Date, "LLL dd, y")}</p>
                </div>
                <div className="col-span-6 inline-block mt-5">
                    <Label>End Date</Label>
                    <p>{format(data?.endDate as Date, "LLL dd, y")}</p>
                </div>
                <div className="col-span-12 border p-4 rounded-xl mt-5">
                    <Label className="text-xl">Positions</Label>
                    <ul className="flex flex-col gap-1">
                        {data?.positions.map((position, index) => (
                            <li
                                key={index}
                                className="p-4 border rounded-xl hover:bg-secondary/40 cursor-pointer"
                            >
                                <span className="border-b">
                                    <Label>{position.title}1</Label>
                                    <p className="tracking-tight text-muted-foreground">
                                        {position.description}
                                    </p>
                                </span>
                            <Label className="text-lg">Candidate(s)</Label>
                            </li>
                        ))}
              {data?.positions.length === 0 && <span className="text-center text-muted-foreground">No positions available.</span>}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default ElectionPage
