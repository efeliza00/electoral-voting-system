"use client"

import { createAnElection as createAnElectionAction } from "@/app/actions/election/create-election"
import { Candidate, ElectionDocument, Position } from "@/app/models/Election"
import { ErrorMessages } from "@/components/error-messages"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { TimePicker } from "@/components/ui/datetime-picker"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  Archive,
  BookUser,
  Building2,
  CalendarDays,
  Images,
  LoaderCircle,
  Scale,
  Trash,
  Trash2,
  UserRound,
  UserRoundPlus,
  X,
} from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState, useTransition } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import { useFieldArray, useForm, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"

type CandidateWithFile = Omit<Candidate, "_id" | "image"> & {
    image?: string | ArrayBuffer | null
}

type PositionWithFileCandidates = Omit<Position, "_id" | "candidates"> & {
    candidates: CandidateWithFile[]
}

type ElectionFormInput = Omit<
    ElectionDocument,
    "status" | "bannerImage" | "positions"
> & {
    bannerImage?: string | ArrayBuffer | null
    positions: PositionWithFileCandidates[]
}

const useCreateElectionForm = () => {
    const [isOngoing, startTransition] = useTransition()
    const methods = useForm<ElectionFormInput>()

    const onSubmit = (formData: ElectionFormInput) => {
        startTransition(async () => {
            try {
                const res = await createAnElectionAction(formData)

                if (res?.success) {
                    methods.reset({
                        name: "",
                        desc: "",
                        positions: [],
                    })
                    toast.success(res.message || "Election Created.")
                    return
                }
                if (res?.details) {
                    Object.entries(res?.details).forEach(([key, message]) => {
                        methods.setError(key as keyof ElectionFormInput, {
                            message: message as string,
                        })
                    })
                }
                if (res?.error && !res?.details) {
                    toast.error(res.error)
                }
            } catch (error) {
                console.error("Submission error:", error)
                toast.error("An unexpected error occurred")
            }
        })
    }

    return {
        methods,
        onSubmit: methods.handleSubmit(onSubmit),
        isCreatingElection: isOngoing,
    }
}

const CreateElectionPositionCandidateForm = ({
    positionIndex,
}: {
    positionIndex: number
}) => {
    const [previewImages, setPreviewImages] = useState<string[]>([])
    const inputUploadCandidateProfileRef = useRef<HTMLInputElement>(null)
    const {
        control,
        setValue,
        clearErrors,
        formState: { errors },
        watch,
    } = useFormContext<ElectionFormInput>()
    const { fields, append, remove } = useFieldArray({
        control,
        name: `positions.${positionIndex}.candidates`,
    })

    return (
        <div className="flex flex-col gap-4">
            {fields.length > 0 && (
                <Label className="font-semibold text-xl ">Candidate(s)</Label>
            )}
            {fields.map((_, index) => {
                const candidateImage = watch(
                    `positions.${positionIndex}.candidates.${index}.image`
                )
                return (
                    <Card key={index} className="relative">
                        <CardContent className="flex items-center gap-4">
                            <div className="flex flex-col items-center gap-2 h-full max-w-1/4 ">
                                <Avatar className="size-20">
                                    <AvatarImage src={previewImages[index]} />
                                    <AvatarFallback>
                                        <UserRound className="w-1/2 text-muted-foreground h-72" />
                                    </AvatarFallback>
                                </Avatar>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id={`candidate-image-${positionIndex}-${index}`}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return

                                        const imageUrl =
                                            URL.createObjectURL(file)
                                        const reader = new FileReader()
                                        reader.onload = () => {
                                            const base64Image =
                                                reader.result as string
                                            setValue(
                                                `positions.${positionIndex}.candidates.${index}.image`,
                                                base64Image
                                            )

                                            setPreviewImages((prev) => {
                                                const updated = [...prev]
                                                updated[index] = imageUrl
                                                return updated
                                            })
                                        }

                                        reader.readAsDataURL(file)
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={() =>
                                        document
                                            .getElementById(
                                                `candidate-image-${positionIndex}-${index}`
                                            )
                                            ?.click()
                                    }
                                    size="default"
                                    variant="default"
                                    className="w-full"
                                >
                                    <Images /> Add Photo
                                </Button>
                                {candidateImage && (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setValue(
                                                `positions.${positionIndex}.candidates.${index}.image`,
                                                ""
                                            )
                                            setPreviewImages((prev) => {
                                                const updated = [...prev]
                                                updated[index] = ""
                                                return updated
                                            })
                                        }}
                                        size="default"
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Trash2 /> Delete Photo
                                    </Button>
                                )}
                            </div>
                            <div className="w-full grid grid-cols-12 gap-2">
                                <FormItem className="col-span-8 relative hidden">
                                    <FormLabel className="sr-only">
                                        Banner{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <Input
                                        ref={inputUploadCandidateProfileRef}
                                        type="file"
                                        accept="images/*"
                                        multiple={false}
                                        draggable
                                        autoComplete="off"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (!file) return

                                            const imageUrl =
                                                URL.createObjectURL(file)
                                            const reader = new FileReader()
                                            reader.readAsDataURL(file)
                                            reader.onload = () => {
                                                const base64Image =
                                                    reader.result as string
                                                setValue(
                                                    `positions.${positionIndex}.candidates.${index}.image`,
                                                    base64Image
                                                )

                                                // Update the preview image
                                                setPreviewImages((prev) => {
                                                    const updated = [...prev]
                                                    updated[index] = imageUrl
                                                    return updated
                                                })
                                            }

                                            reader.readAsDataURL(file)
                                        }}
                                    />

                                    <FormMessage />
                                </FormItem>
                                <FormLabel
                                    htmlFor={`positions.${positionIndex}.candidates.name`}
                                    className="col-span-4"
                                >
                                    <FormField
                                        control={control}
                                        name={`positions.${positionIndex}.candidates.${index}.name`}
                                        render={({
                                            field: { value, onChange },
                                        }) => (
                                            <FormItem className="w-full">
                                                <FormLabel className="font-semibold text-xs">
                                                    Name{" "}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        value={value}
                                                        onChange={onChange}
                                                        autoComplete="off"
                                                    />
                                                </FormControl>
                                                {errors.positions?.[
                                                    positionIndex
                                                ]?.candidates?.[index]
                                                    ?.name && (
                                                    <span className="text-destructive">
                                                        {
                                                            errors.positions[
                                                                positionIndex
                                                            ]?.candidates?.[
                                                                index
                                                            ]?.name.message
                                                        }
                                                    </span>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </FormLabel>
                                <FormLabel
                                    htmlFor={`positions.${positionIndex}.candidates.bio`}
                                    className="col-span-12"
                                >
                                    <FormField
                                        control={control}
                                        name={`positions.${positionIndex}.candidates.${index}.bio`}
                                        render={({
                                            field: { value, onChange },
                                        }) => (
                                            <FormItem className="w-full">
                                                <FormLabel className="font-semibold text-xs">
                                                    Bio{" "}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        value={value}
                                                        onChange={onChange}
                                                        autoComplete="off"
                                                    />
                                                </FormControl>
                                                {errors.positions?.[
                                                    positionIndex
                                                ]?.candidates?.[index]?.bio && (
                                                    <span className="text-destructive">
                                                        {
                                                            errors.positions[
                                                                positionIndex
                                                            ]?.candidates?.[
                                                                index
                                                            ]?.bio.message
                                                        }
                                                    </span>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </FormLabel>
                            </div>
                        </CardContent>
                        <Separator />
                        <CardFooter>
                            <Button
                                type="button"
                                size="default"
                                variant="outline"
                                onClick={() => {
                                    setPreviewImages(
                                        (prevStatePreviewImages) => {
                                            const updatedImage =
                                                prevStatePreviewImages.filter(
                                                    (item) =>
                                                        item !==
                                                        prevStatePreviewImages[
                                                            index
                                                        ]
                                                )
                                            return updatedImage
                                        }
                                    )
                                    remove(index)
                                }}
                                className=" ml-auto"
                            >
                                <Trash className="size-5 text-red-600 " />
                                Remove
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })}
            {fields.length === 0 && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        clearErrors("positions")
                        append({
                            name: "",
                            bio: "",
                            image: "",
                        })
                    }}
                    className="ml-auto"
                >
                    <UserRoundPlus /> Add Candidate
                </Button>
            )}
            {fields.length > 0 && (
                <Button
                    type="button"
                    variant="default"
                    size="lg"
                    onClick={() =>
                        append({
                            name: "",
                            bio: "",
                            image: "",
                        })
                    }
                    className="ml-auto"
                >
                    <UserRoundPlus /> Add Candidate
                </Button>
            )}
        </div>
    )
}

const CreateElectionPositionForm = () => {
    const {
        control,
        formState: { errors },
    } = useFormContext<ElectionFormInput>()
    const { fields, append, remove } = useFieldArray({
        control,
        name: "positions",
    })

    return (
        <ul className="space-y-4 ">
            <li className="grid place-items-center">
                {fields.length === 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            append({
                                title: "",
                                description: "",
                                numberOfWinners: 1,
                                candidates: [],
                                winners: [],
                            })
                        }
                    >
                        <Scale /> Add Position
                    </Button>
                )}{" "}
            </li>

            {fields.length > 0 && (
                <Label className="font-semibold text-xl">
                    Electoral Position(s)
                </Label>
            )}

            {fields.map((_, index) => {
                return (
                    <Card key={index}>
                        <CardContent className="grid grid-cols-12 gap-4 relative">
                            <FormLabel
                                htmlFor={`positions.${index}.numberOfWinners`}
                                className="col-span-2"
                            >
                                <FormField
                                    control={control}
                                    name={`positions.${index}.numberOfWinners`}
                                    render={({
                                        field: { value, onChange },
                                    }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="font-semibold text-xs">
                                                Number of Winners{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    value={value}
                                                    onChange={onChange}
                                                    min="1"
                                                    step="1"
                                                    autoComplete="off"
                                                />
                                            </FormControl>
                                            {errors.positions?.[index]
                                                ?.numberOfWinners && (
                                                <span className="text-destructive">
                                                    {
                                                        errors.positions[index]
                                                            ?.numberOfWinners
                                                            ?.message
                                                    }
                                                </span>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </FormLabel>
                            <FormLabel
                                htmlFor={`positions.${index}.title`}
                                className="col-span-3"
                            >
                                <FormField
                                    control={control}
                                    name={`positions.${index}.title`}
                                    render={({
                                        field: { value, onChange },
                                    }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="font-semibold text-xs">
                                                Title{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    value={value}
                                                    onChange={onChange}
                                                    autoComplete="off"
                                                />
                                            </FormControl>
                                            <FormMessage>
                                                {errors.positions?.[index]
                                                    ?.title && (
                                                    <span className="text-destructive">
                                                        {
                                                            errors.positions[
                                                                index
                                                            ]?.title?.message
                                                        }
                                                    </span>
                                                )}
                                            </FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </FormLabel>
                            <FormLabel
                                htmlFor={`positions.${index}.description`}
                                className="col-span-12"
                            >
                                <FormField
                                    control={control}
                                    name={`positions.${index}.description`}
                                    render={({
                                        field: { value, onChange },
                                    }) => (
                                        <FormItem className="w-full">
                                            <FormLabel className="font-semibold text-xs">
                                                Description
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    value={value}
                                                    onChange={onChange}
                                                    autoComplete="off"
                                                    className="w-full"
                                                />
                                            </FormControl>
                                            {errors.positions?.[index]
                                                ?.description && (
                                                <span className="text-destructive">
                                                    {
                                                        errors.positions[index]
                                                            ?.description
                                                            ?.message
                                                    }
                                                </span>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </FormLabel>

                            <FormLabel className="col-span-12 ml-auto">
                                {index === fields.length - 1 && (
                                    <Button
                                        type="button"
                                        variant="default"
                                        onClick={() =>
                                            append({
                                                title: "",
                                                description: "",
                                                numberOfWinners: 1,
                                                candidates: [],
                                                winners: [],
                                            })
                                        }
                                    >
                                        <BookUser /> Add a Position
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => remove(index)}
                                >
                                    <Trash className="text-red-600" /> Remove
                                    Position
                                </Button>
                            </FormLabel>
                        </CardContent>
                        <Separator />
                        <CardContent>
                            <CreateElectionPositionCandidateForm
                                positionIndex={index}
                            />
                        </CardContent>
                    </Card>
                )
            })}
        </ul>
    )
}

const CreateElectionForm = ({
    isCreatingElection,
}: {
    isCreatingElection: boolean
}) => {
    const inputUploadBannerRef = useRef<HTMLInputElement>(null)
    const [previewBannerImage, setPreviewBannerImage] = useState<string>()
    const {
        control,
        setValue,
        formState: { errors },
        watch,
    } = useFormContext<ElectionFormInput>()

    const previewBannerImageValue = watch("bannerImage")

    useEffect(() => {
        if (!previewBannerImageValue) {
            setPreviewBannerImage("")
        }
    }, [previewBannerImageValue])

    return (
        <div className="grid grid-cols-12 gap-4">
            {errors && (
                <div className="sticky top-0 col-span-12 z-50 bg-secondary">
                    <ErrorMessages
                        errors={errors}
                        title="Heads Up!"
                        className="border-destructive text-base bg-destructive/20"
                    />
                </div>
            )}
            <div className="col-span-6 h-72 w-full rounded-xl group relative bg-accent border overflow-hidden flex items-center justify-center">
                {previewBannerImage ? (
                    <Image
                        src={previewBannerImage}
                        quality={100}
                        fill
                        sizes="vw"
                        alt="banner-image"
                        className="group-hover:scale-105 duration-200 w-1/4 transition-transform object-cover"
                    />
                ) : (
                    <Building2
                        strokeWidth={1.5}
                        className="w-1/2 text-muted-foreground h-72"
                    />
                )}
                <Button
                    type="button"
                    onClick={() => inputUploadBannerRef.current?.click()}
                    size="icon"
                    variant="outline"
                    className="rounded-full absolute top-2  left-4"
                >
                    <Images />
                </Button>
                {previewBannerImage && (
                    <Button
                        type="button"
                        onClick={() => {
                            setValue("bannerImage", "")
                        }}
                        size="icon"
                        variant="outline"
                        className="rounded-full absolute top-2  right-4"
                    >
                        <X />
                    </Button>
                )}
            </div>
            <div className="col-span-6 space-y-4">
                <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="col-span-4">
                            <FormLabel>
                                Name <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input autoComplete="off" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormItem className="col-span-4 relative hidden">
                    <FormLabel className="sr-only">
                        Banner <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input
                        ref={inputUploadBannerRef}
                        type="file"
                        accept="images/*"
                        multiple={false}
                        draggable
                        autoComplete="off"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return

                            const imageUrl = URL.createObjectURL(file)
                            setPreviewBannerImage(imageUrl)

                            const reader = new FileReader()
                            reader.onload = () => {
                                const base64Image = reader.result as string
                                setValue("bannerImage", base64Image)
                            }
                            reader.readAsDataURL(file)

                            return () => {
                                URL.revokeObjectURL(imageUrl)
                            }
                        }}
                    />

                    <FormMessage />
                </FormItem>
                <FormField
                    control={control}
                    name="desc"
                    render={({ field }) => (
                        <FormItem className="col-span-12">
                            <FormLabel>
                                Description{" "}
                                <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Textarea autoComplete="off" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
                control={control}
                name="startDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col col-span-12 md:col-span-6">
                        <FormLabel>
                            Election Start Date{" "}
                            <span className="text-destructive">*</span>
                        </FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] pl-3 text-left font-normal",
                                            !field.value &&
                                                "text-muted-foreground"
                                        )}
                                    >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-4S"
                                align="start"
                            >
                                <DayPicker
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={[
                                        { dayOfWeek: [0, 6] },
                                        (date) =>
                                            date <
                                            new Date(
                                                new Date().setHours(0, 0, 0, 0)
                                            ),
                                    ]}
                                />
                            </PopoverContent>
                        </Popover>
                        <FormDescription>
                            Enter the start date of the election.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="startDate"
                render={({ field: { value, onChange } }) => (
                    <FormItem className="flex flex-col col-span-12 md:col-span-6">
                        <FormLabel>
                            Election Start Time{" "}
                            <span className="text-destructive">*</span>
                        </FormLabel>
                        <TimePicker
                            date={value}
                            onChange={onChange}
                            hourCycle={12}
                            granularity="minute"
                        />
                        <FormDescription>
                            Enter the start time of the election.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="endDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col col-span-12 md:col-span-6">
                        <FormLabel>
                            Election End Date{" "}
                            <span className="text-destructive">*</span>
                        </FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] pl-3 text-left font-normal",
                                            !field.value &&
                                                "text-muted-foreground"
                                        )}
                                    >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-4"
                                align="start"
                            >
                                <DayPicker
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={[
                                        { dayOfWeek: [0, 6] },
                                        (date) =>
                                            date <
                                            new Date(
                                                new Date().setHours(0, 0, 0, 0)
                                            ),
                                    ]}
                                />
                            </PopoverContent>
                        </Popover>
                        <FormDescription>
                            Enter the end date of the election.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="endDate"
                render={({ field: { value, onChange } }) => (
                    <FormItem className="flex flex-col col-span-12 md:col-span-6">
                        <FormLabel>
                            Election End Time{" "}
                            <span className="text-destructive">*</span>
                        </FormLabel>
                        <TimePicker
                            date={value}
                            onChange={onChange}
                            hourCycle={12}
                            granularity="minute"
                        />
                        <FormDescription>
                            Enter the end time of the election.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormItem className="col-span-12">
                <CreateElectionPositionForm />
            </FormItem>
            <FormItem className="col-span-12">
                <Button type="submit" disabled={isCreatingElection}>
                    {isCreatingElection ? (
                        <LoaderCircle className="animate-spin" />
                    ) : (
                        <>
                            <Archive />
                            <span>Create Election</span>
                        </>
                    )}
                </Button>
            </FormItem>
        </div>
    )
}

const CreateElectionPage = () => {
    const { methods, onSubmit, isCreatingElection } = useCreateElectionForm()
    return (
        <div className="h-screen w-full flex flex-col gap-4">
            <div className="border-b pb-1">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    Create an Election
                </h3>
                <p className="leading-7 text-muted-foreground">
                    Configure your election parameters and launch the voting
                    process.
                </p>
            </div>
            <Form {...methods}>
                <form onSubmit={onSubmit}>
                    <CreateElectionForm
                        isCreatingElection={isCreatingElection}
                    />
                </form>
            </Form>
        </div>
    )
}

export default CreateElectionPage
