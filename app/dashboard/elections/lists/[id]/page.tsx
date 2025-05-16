"use client"

import { ElectionDocument } from "@/app/models/Election"
import AddVoters from "@/components/add-voters"
import { ErrorMessages } from "@/components/error-messages"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { LoaderCircle } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
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

const ElectionPage = () => {
    const pathname = usePathname()
    const { data, error, isLoading } = useSWR<ElectionDocument>(
        `/api/elections/${pathname.split("/").pop()}`,
      fetcher, {
      shouldRetryOnError: false
    }
    )
    if (isLoading)
        return (
            <div className="h-full w-full flex items-center justify-center">
                <LoaderCircle className="animate-spin size-10" />
            </div>
        )
    if (error) return <ErrorMessages errors={error} />

    return (
      <div className="grid grid-cols-12 gap-1 min-h-full w-full">
        <div className="col-span-12 relative h-72 w-full border bg-secondary-foreground/3 rounded-t-xl overflow-hidden">
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
            <Image
                src="/images/no-image.png"
                fill
                quality={100}
                alt={`${data?.name}-image`}
              className="object-contain bg-transparent"
              sizes="100vw"
            />
          )}
        </div>
        <div className="col-span-12 flex items-center justify-between mt-5 border-b">
          <div >
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              {data?.name}
            </h3>
            <p className="leading-7 text-muted-foreground">
              {data?.desc}
            </p>
          </div>
          <AddVoters />
        </div>
        <div className="col-span-6 inline-block mt-5">
          <Label>Start Date</Label>
          <p>{format(data?.startDate as Date, "LLL dd, y")}</p>
        </div>
        <div className="col-span-6 inline-block mt-5">
          <Label>End Date</Label>
          <p>{format(data?.endDate as Date, "LLL dd, y")}</p>
        </div>
        <div className="col-span-12 mt-5">
          <Label className="text-xl ">Position(s)</Label>
          <ul className="flex flex-col gap-4 mt-4">
            {data?.positions.map((position, index) => (
              <li
                key={index}
                className="p-4 border rounded-xl hover:outline-2 hover:outline-inset-2 duration-100 transition-colors cursor-pointer"
              >
                <span className="border-b">
                  <Label className="text-xl md:text-2xl">
                    {position.title}
                  </Label>
                  <p className="tracking-tight text-muted-foreground">
                    {position.description}
                  </p>
                </span>
                <Label className="text-lg">Candidate(s)</Label>
                {position.candidates.length === 0 && (
                  <span className="text-center mt-4 text-muted-foreground">
                    No candidates available.
                  </span>
                )}
                <ul className="gap-2 mt-4 grid grid-cols-4 grid-flow-col">
                  {position.candidates.map((candidate, index) => (
                    <li
                      key={index}
                      className="border rounded-xl p-4"
                    >
                      {candidate?.image ? (
                        <Image
                          src={candidate?.image}
                          height={100}
                          quality={100}
                          width={100}
                          alt={`candidate-${candidate.name}-image`}
                          className="mx-auto rounded-full  object-cover"
                        />
                      ) : (
                        <Image
                          src={"/images/no-image.png"}
                          height={100}
                          quality={100}
                          width={100}
                          alt={`${data?.name}-image`}
                          className="mx-auto rounded-full outline-2"
                        />
                      )}
                      <Label className="text-xl mt-4">{candidate.name}</Label>
                      <p className="text-muted-foreground">{candidate.bio}</p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            {data?.positions.length === 0 && (
              <span className="text-center text-muted-foreground">
                No positions available.
              </span>
            )}
          </ul>
        </div>
      </div>
    )
}

export default ElectionPage
