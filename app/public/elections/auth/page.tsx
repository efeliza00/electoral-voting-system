"use client"
import { ElectionDocument } from "@/app/models/Election"
import { ErrorMessages } from "@/components/error-messages"
import Loader from "@/components/loader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import {
  Boxes,
  Calendar,
  CircleAlert,
  Clock3,
  LoaderCircle,
  ShieldQuestion,
} from "lucide-react"
import { signIn as signInAction } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useTransition } from "react"
import toast from "react-hot-toast"
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

const VoterAuthorizeDetail = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callback") || ""
    const decodedUrl = decodeURIComponent(callbackUrl)
    const paths = decodedUrl.split("/")
    const [isOngoing, startTransition] = useTransition()
    const electionId = paths[paths.length - 2]
    const [cluster, setCluster] = useState("")
    const [voterId, setVoterId] = useState("")
    const [accessCode, setAccessCode] = useState("")
    const [verifyVoterError, setVerifyVoterError] = useState("")
    const { data, error, isLoading } = useSWR<ElectionDocument>(
        `/api/elections/public/${electionId}`,
        fetcher,
        {
            revalidateOnFocus: false,
        }
    )

    const {
        data: clusters,
        error: clustersError,
        isLoading: isLoadingClusters,
    } = useSWR<{ id: string; name: string }[]>(
        `/api/elections/clusters?q=${electionId}`,
        fetcher,
        {
            revalidateOnFocus: false,
        }
    )

    const handleVerifyVoter = ({
        cluster,
        voterId,
        accessCode,
    }: {
        cluster: string
        voterId: string
        accessCode: string
    }) => {
        startTransition(async () => {
            const res = await signInAction("voter", {
                cluster: cluster,
                voterId: voterId,
                accessCode: accessCode.toLocaleUpperCase(),
                electionId: electionId,
                redirect: false,
            })

            if (res?.ok) {
                toast.success(`Verified!Redirecting...`)
                setVerifyVoterError("")
                router.push(decodedUrl)
            } else {
                setVerifyVoterError(res?.error as string)
            }
        })
    }
    if (isLoading)
        return (
            <div className="h-full w-full flex items-center justify-center">
            <Loader />
            </div>
        )
    if (error) return <ErrorMessages errors={error} />

    return (
      <div className="container min-h-screen max-w-full md:max-w-xl mx-auto my-20 flex flex-col items-center ">
            <div className="rounded-full border p-4 bg-secondary">
          <ShieldQuestion className="size-24" />
            </div>
            <h1 className="font-bold text-4xl">Secure Voter Access</h1>
            <p>Verify your identity to cast your ballot</p>
            <Card className="w-full mt-5">
                <CardHeader>
                    <CardTitle>
                        <span className="flex items-center gap-2 capitalize">
                            <Calendar />
                            {data?.name}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
              <Clock3 />
              <p className="leading-7">
                {format(data?.startDate as Date, "LLL dd, y")}{" "}
                {format(data?.startDate as Date, "hh:mm a")} -
                {format(data?.endDate as Date, "LLL dd, y")}{" "}
                {format(data?.endDate as Date, "hh:mm a")}
              </p>
                    </div>
                </CardContent>
          <CardFooter></CardFooter>
            </Card>
            <Card className="w-full mt-5">
                <CardHeader>
                    <CardTitle className=" text-center text-xl md:text-2xl tracking-tight">
                        Fill in the fields
                    </CardTitle>
                </CardHeader>
          <Separator />
                <CardContent className="space-y-4">
            <Alert
              variant="default"
              className="border-yellow-300 bg-yellow-100/20"
            >
              <CircleAlert className="text-yellow-300" />
              <AlertTitle className="text-yellow-800">
                Take Note!
              </AlertTitle>
              <AlertDescription className="text-yellow-800">
                Please protect your information. This verification
                is a one-time use only. Distributing your personal
                verification information to others will have a
                chance to loose your right to vote.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2 ">
                        {clustersError ? (
                            <ErrorMessages errors={clustersError} />
                        ) : (
                  <div className="space-y-1.5">
                    <Label>Voting Cluster</Label>
                    <Select
                      value={cluster}
                      onValueChange={(value) => setCluster(value)}
                    >
                      <SelectTrigger className="w-full !h-12 font-bold">
                        <SelectValue placeholder="Select a Cluster" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingClusters && (
                          <div className="h-full w-full flex items-center justify-center">
                            <Loader />
                          </div>
                        )}
                        {clusters?.length &&
                          clusters.length > 0 ? (
                          clusters?.map((cluster, index) => (
                            <SelectItem
                              key={index}
                              value={cluster.name}
                              className="uppercase"
                            >
                              {cluster.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="w-full flex flex-col items-center justify-between gap-2 p-2">
                            <Boxes
                              strokeWidth={1}
                              className="size-16  bg-muted p-2 rounded-xl text-muted-foreground"
                            />
                            <span className="text-muted-foreground italic text-sm">
                              No clusters available.
                            </span>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                            </div>
                        )}
              <div className="space-y-1.5">
                <Label>Voter ID</Label>
                <Input
                  autoComplete="off"
                  value={voterId}
                  placeholder="Voter ID"
                  onChange={(e) => {
                    const value = e.target.value
                    setVoterId(value)
                  }}
                  className="uppercase h-12 font-semibold !text-xl !text-center tracking-widest"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Access Code</Label>
                <Input
                  autoComplete="off"
                  value={accessCode}
                  placeholder="Access Code"
                  onChange={(e) => {
                    const value = e.target.value
                    setAccessCode(value)
                  }}
                  className="uppercase h-12 font-semibold  !text-xl !text-center tracking-widest"
                />
              </div>
              {verifyVoterError && (
                            <Alert
                                variant="destructive"
                                className="bg-destructive/20"
                            >
                  <CircleAlert />
                                <AlertDescription className="text-destructive-800 ">
                                    {verifyVoterError}
                                </AlertDescription>
                            </Alert>
                        )}
            </div>
                </CardContent>
                <Separator />
                <CardFooter className="mx-auto">
                    <Button
                        type="button"
                        disabled={isOngoing}
                        onClick={() =>
                            handleVerifyVoter({ cluster, voterId, accessCode })
                        }
                        size="lg"
                    >
                        {isOngoing && <LoaderCircle className="animate-spin" />}{" "}
                        <ShieldQuestion /> <span>Verify Voter</span>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

const VoterAuthorizePage = () => {
  return (
    <Suspense fallback={"loading..."}>
      <VoterAuthorizeDetail />
    </Suspense>
  )
}

export default VoterAuthorizePage
