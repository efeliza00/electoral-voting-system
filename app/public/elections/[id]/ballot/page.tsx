"use client"

import { sendVotes } from "@/app/actions/voters/send-votes"
import { Candidate, ElectionDocument, Position } from "@/app/models/Election"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import {
    AlertTriangle,
    Boxes,
    CalendarDays,
    CheckCircle,
    Info,
    Loader2,
    UserRound,
    Vote,
} from "lucide-react"
import { Types } from "mongoose"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import useSWR from "swr"
import * as z from "zod"

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

const useGetSession = () => {
    const { data, status } = useSession()

    return {
        session: data,
        status,
    }
}

const useGetElection = () => {
    const params = useParams()
    const { data, error, isLoading } = useSWR<Omit<ElectionDocument, "voters">>(
        `/api/elections/${params.id}`,
        fetcher
    )

    return {
        data,
        error,
        isLoading,
    }
}

const BallotForm = ({
    electionData,
}: {
    electionData: Omit<ElectionDocument, "voters">
}) => {
    const [showReview, setShowReview] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const ballotSchema = useMemo(() => {
        const schemaFields: Record<string, z.ZodTypeAny> = {}
        electionData.positions.forEach((position) => {
            if (position.numberOfWinners && position.numberOfWinners > 1) {
                schemaFields[String(position._id)] = z
                    .array(z.string())
                    .optional()
            } else {
                schemaFields[String(position._id)] = z.string().optional()
            }
        })
        return z.object(schemaFields)
    }, [electionData])

    type BallotFormValues = z.infer<typeof ballotSchema>

    const defaultValues = useMemo(() => {
        const defaults: Record<string, string[] | string> = {}
        electionData.positions.forEach((position) => {
            if (position.numberOfWinners && position.numberOfWinners > 1) {
                defaults[String(position._id)] = []
            } else {
                defaults[String(position._id)] = ""
            }
        })
        return defaults
    }, [electionData])

    const [isOngoing, startTransition] = useTransition()
    const { session } = useGetSession()
    const {
        watch,
        handleSubmit,
        reset,
        trigger,
        control,
        formState: { errors, isDirty },
    } = useForm<BallotFormValues>({
        resolver: zodResolver(ballotSchema),
        defaultValues,
        mode: "onChange",
    })

    const watchedValues = watch()

    useEffect(() => {
        if (electionData && defaultValues) {
            reset(defaultValues)
        }
    }, [electionData, defaultValues, reset])

    const getSelectedCandidates = (position: Position): Candidate[] => {
        if (!position?._id) {
            return []
        }
        const fieldValue =
            watchedValues[String(position._id) as keyof BallotFormValues]

        if (position.numberOfWinners && position.numberOfWinners > 1) {
            const candidateIds = Array.isArray(fieldValue) ? fieldValue : []
            return candidateIds
                .map((id) =>
                    position.candidates.find(
                        (candidate) => String(candidate._id) === id
                    )
                )
                .filter((candidate): candidate is Candidate => !!candidate)
        } else if (typeof fieldValue === "string" && fieldValue) {
            const candidate = position.candidates.find(
                (candidate) => String(candidate._id) === fieldValue
            )
            return candidate ? [candidate] : []
        }
        return []
    }

    const totalPositions = electionData.positions.length

    const getCompletedPositions = () => {
        if (!electionData) return 0
        return Object.values(watchedValues).filter((value) => {
            if (Array.isArray(value)) {
                return value.length > 0
            }
            return !!value
        }).length
    }

    const completedPositions = getCompletedPositions()

    const onSubmit = (data: BallotFormValues) => {
        startTransition(async () => {
            const res = await sendVotes({
                electionID: new Types.ObjectId(electionData._id),
                voterID: new Types.ObjectId(session?.user.id),
                votes: data,
            })

            if (res?.message) {
                toast.success(res.message)
                setIsSubmitted(true)
                setShowConfirmation(false)
                return
            }
        })
    }

    const handleReviewBallot = async () => {
        const isFormValid = await trigger()
        if (isFormValid) {
            setShowReview(true)
        }
    }

    const handleConfirmSubmit = () => {
        setShowReview(false)
        setShowConfirmation(true)
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-2xl">
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl text-green-800">
                                Ballot Successfully Submitted!
                            </CardTitle>
                            <CardDescription className="text-green-700">
                                Your vote has been recorded and will be counted
                                in the official election results.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <div className="bg-white p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Confirmation Details
                                </h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>Election: {electionData.name}</p>
                                    <p>
                                        Submitted: {new Date().toLocaleString()}
                                    </p>
                                    <p>
                                        Positions Voted: {completedPositions} of{" "}
                                        {totalPositions}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-green-700">
                                    Thank you for participating in the
                                    democratic process!
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    You will receive an email confirmation
                                    shortly. Keep this confirmation for your
                                    records.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-8">
                    {electionData.positions.map((position, index) => (
                        <Card
                            key={String(position._id)}
                            className="shadow-sm pt-0 overflow-hidden"
                        >
                            <CardHeader className="bg-secondary py-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <span className="capitalize">
                                                {position.title}
                                            </span>
                                            {getSelectedCandidates(position)
                                                .length > 0 && (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            )}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {position.description}
                                            {position.numberOfWinners &&
                                                position.numberOfWinners >
                                                    1 && (
                                                    <span className="block mt-1 text-blue-600 font-medium">
                                                        Select up to{" "}
                                                        {
                                                            position.numberOfWinners
                                                        }{" "}
                                                        candidates
                                                    </span>
                                                )}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline">
                                        Position {index + 1} of {totalPositions}
                                    </Badge>
                                </div>
                                {errors[
                                    String(
                                        position._id
                                    ) as keyof BallotFormValues
                                ] && (
                                    <Alert className="mt-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription className="text-red-600">
                                            {
                                                errors[
                                                    String(
                                                        position._id
                                                    ) as keyof BallotFormValues
                                                ]?.message as string
                                            }
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardHeader>
                            <CardContent className="p-6">
                                {position.numberOfWinners &&
                                position.numberOfWinners > 1 ? (
                                    <Controller
                                        name={
                                            String(
                                                position._id
                                            ) as keyof BallotFormValues
                                        }
                                        control={control}
                                        render={({ field }) => {
                                            const selectedCandidates =
                                                Array.isArray(field.value)
                                                    ? field.value
                                                    : []

                                            return (
                                                <div className="space-y-4">
                                                    <div className="bg-blue-50 p-3 rounded-lg text-sm flex items-center gap-2 mb-4">
                                                        <Info className="h-4 w-4 text-blue-600" />
                                                        <span>
                                                            Select up to{" "}
                                                            {
                                                                position.numberOfWinners
                                                            }{" "}
                                                            candidates for this
                                                            position. You have
                                                            selected{" "}
                                                            {
                                                                selectedCandidates.length
                                                            }{" "}
                                                            of{" "}
                                                            {
                                                                position.numberOfWinners
                                                            }
                                                            .
                                                        </span>
                                                    </div>
                                                    {position.candidates.map(
                                                        (candidate) => {
                                                            const candidateId =
                                                                String(
                                                                    candidate._id
                                                                )
                                                            const isSelected =
                                                                selectedCandidates.includes(
                                                                    candidateId
                                                                )
                                                            const canSelect =
                                                                selectedCandidates.length <
                                                                    (position.numberOfWinners ??
                                                                        0) ||
                                                                isSelected

                                                            return (
                                                                <div
                                                                    key={
                                                                        candidateId
                                                                    }
                                                                    className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                                                                        isSelected
                                                                            ? "bg-blue-50 border-blue-200"
                                                                            : canSelect
                                                                              ? "hover:bg-gray-50 border-gray-200"
                                                                              : "bg-gray-50 border-gray-200 opacity-50"
                                                                    }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`${String(position._id)}-${candidateId}`}
                                                                        checked={
                                                                            isSelected
                                                                        }
                                                                        disabled={
                                                                            !canSelect
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const value =
                                                                                (field.value as string[]) ||
                                                                                []
                                                                            if (
                                                                                e
                                                                                    .target
                                                                                    .checked
                                                                            ) {
                                                                                field.onChange(
                                                                                    [
                                                                                        ...value,
                                                                                        candidateId,
                                                                                    ]
                                                                                )
                                                                            } else {
                                                                                field.onChange(
                                                                                    value.filter(
                                                                                        (
                                                                                            id
                                                                                        ) =>
                                                                                            id !==
                                                                                            candidateId
                                                                                    )
                                                                                )
                                                                            }
                                                                        }}
                                                                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <Label
                                                                            htmlFor={`${String(position._id)}-${candidateId}`}
                                                                            className={`cursor-pointer ${!canSelect ? "cursor-not-allowed" : ""}`}
                                                                        >
                                                                            <div className="flex items-start gap-4">
                                                                                <Avatar className="h-12 w-12">
                                                                                    <AvatarImage
                                                                                        src={
                                                                                            candidate.image
                                                                                        }
                                                                                        alt={
                                                                                            candidate.name
                                                                                        }
                                                                                    />
                                                                                    <AvatarFallback>
                                                                                        {candidate.name
                                                                                            .split(
                                                                                                " "
                                                                                            )
                                                                                            .map(
                                                                                                (
                                                                                                    n
                                                                                                ) =>
                                                                                                    n[0]
                                                                                            )
                                                                                            .join(
                                                                                                ""
                                                                                            )}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                                <div className="flex-1">
                                                                                    <h4 className="font-semibold">
                                                                                        {
                                                                                            candidate.name
                                                                                        }
                                                                                    </h4>
                                                                                    <p className="text-sm text-muted-foreground mb-2">
                                                                                        {
                                                                                            candidate.bio
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </Label>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                    )}
                                                </div>
                                            )
                                        }}
                                    />
                                ) : (
                                    <Controller
                                        name={
                                            String(
                                                position._id
                                            ) as keyof BallotFormValues
                                        }
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                value={
                                                    (field.value as string) ||
                                                    ""
                                                }
                                                onValueChange={field.onChange}
                                            >
                                                <div className="space-y-4">
                                                    {position.candidates.map(
                                                        (candidate) => {
                                                            const candidateId =
                                                                String(
                                                                    candidate._id
                                                                )
                                                            return (
                                                                <div
                                                                    key={
                                                                        candidateId
                                                                    }
                                                                    className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                                                                >
                                                                    <RadioGroupItem
                                                                        value={
                                                                            candidateId
                                                                        }
                                                                        id={`${String(position._id)}-${candidateId}`}
                                                                        className="mt-1"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <Label
                                                                            htmlFor={`${String(position._id)}-${candidateId}`}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <div className="flex items-start gap-4">
                                                                                <Avatar className="h-12 w-12">
                                                                                    <AvatarImage
                                                                                        src={
                                                                                            candidate.image
                                                                                        }
                                                                                        alt={
                                                                                            candidate.name
                                                                                        }
                                                                                    />
                                                                                    <AvatarFallback>
                                                                                        {candidate.name
                                                                                            .split(
                                                                                                " "
                                                                                            )
                                                                                            .map(
                                                                                                (
                                                                                                    n
                                                                                                ) =>
                                                                                                    n[0]
                                                                                            )
                                                                                            .join(
                                                                                                ""
                                                                                            )}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                                <div className="flex-1">
                                                                                    <h4 className="font-semibold">
                                                                                        {
                                                                                            candidate.name
                                                                                        }
                                                                                    </h4>
                                                                                    <p className="text-sm text-muted-foreground mb-2">
                                                                                        {
                                                                                            candidate.bio
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </Label>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                    )}
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        {completedPositions < totalPositions && (
                            <span className="text-amber-600">
                                {totalPositions - completedPositions}{" "}
                                position(s) remaining
                            </span>
                        )}
                        {completedPositions === totalPositions && (
                            <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                All positions completed
                            </span>
                        )}
                        {isDirty && (
                            <span className="ml-2 text-blue-600">
                                • Changes detected
                            </span>
                        )}
                    </div>
                    <div className="space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReviewBallot}
                            disabled={!isDirty}
                        >
                            Review Ballot
                        </Button>
                        <Button
                            type="button"
                            onClick={handleReviewBallot}
                            disabled={!isDirty}
                        >
                            Submit Ballot
                        </Button>
                    </div>
                </div>
            </form>

            <Dialog open={showReview} onOpenChange={setShowReview}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review Your Ballot</DialogTitle>
                        <DialogDescription>
                            Please review your selections before submitting your
                            ballot.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {electionData.positions.map((position) => {
                            const selectedCandidates =
                                getSelectedCandidates(position)

                            return (
                                <div
                                    key={String(position._id)}
                                    className="border rounded-lg p-4"
                                >
                                    <h4 className="font-semibold flex items-center gap-2">
                                        {position.title}
                                        {position.numberOfWinners &&
                                            position.numberOfWinners > 1 && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    Select up to{" "}
                                                    {position.numberOfWinners}
                                                </Badge>
                                            )}
                                    </h4>
                                    {selectedCandidates.length > 0 ? (
                                        <div className="mt-2 space-y-2">
                                            {selectedCandidates.map(
                                                (candidate) => (
                                                    <div
                                                        key={String(
                                                            candidate._id
                                                        )}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="text-xs">
                                                                {candidate.name
                                                                    .split(" ")
                                                                    .map(
                                                                        (n) =>
                                                                            n[0]
                                                                    )
                                                                    .join("")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">
                                                                {candidate.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-2 text-muted-foreground italic">
                                            No selection made
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowReview(false)}
                        >
                            Continue Editing
                        </Button>
                        <Button onClick={handleConfirmSubmit}>
                            Submit Ballot
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Ballot Submission</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to submit your ballot? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Once submitted, you will not be able to change your
                            selections. Please ensure all your choices are
                            correct.
                        </AlertDescription>
                    </Alert>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            disabled={isOngoing}
                            onClick={() => setShowConfirmation(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isOngoing}
                            onClick={handleSubmit(onSubmit)}
                        >
                            Yes, Submit Ballot
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

const BallotPage = () => {
    const { session } = useGetSession()
    const {
        data: electionData,
        error: electionError,
        isLoading: isLoadingElection,
    } = useGetElection()

    if (isLoadingElection) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-2xl">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                            <h2 className="text-xl font-semibold mb-2">
                                Loading Your Ballot
                            </h2>
                            <p className="text-muted-foreground text-center">
                                Please wait while we prepare your personalized
                                ballot...
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (electionError || !electionData) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-2xl">
                    <Card className="border-red-200">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <AlertTriangle className="h-8 w-8 text-red-600 mb-4" />
                            <h2 className="text-xl font-semibold mb-2 text-red-800">
                                Error Loading Ballot
                            </h2>
                            <p className="text-muted-foreground text-center mb-4">
                                {electionError?.message}
                            </p>
                            <Button onClick={() => window.location.reload()}>
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex gap-2 items-center">
                <div className=" rounded-full p-4 bg-primary/30">
                    <Vote className="size-14" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Official Ballot</h1>
                    <p className="text-muted-foreground">{electionData.name}</p>
                </div>
            </div>
            <div className="flex items-center justify-between my-10">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    {electionData?.startDate && (
                        <span>
                            Election Date:{" "}
                            {format(
                                new Date(electionData.endDate),
                                "LLL dd, y"
                            )}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 ">
                    <Boxes className="h-5 w-5" />
                    <span>Cluster: {session?.user.cluster}</span>
                </div>
                <div className="flex items-center gap-2 ">
                    <UserRound className="h-5 w-5" />
                    <span>Voter ID: {session?.user.voterId}</span>
                </div>
            </div>
            <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Instructions:</strong> Select one or more candidates
                    for each position. You may leave positions blank if you
                    choose not to vote for that office. Review your selections
                    before submitting.
                </AlertDescription>
            </Alert>
            <BallotForm electionData={electionData} />
        </>
    )
}

export default BallotPage
