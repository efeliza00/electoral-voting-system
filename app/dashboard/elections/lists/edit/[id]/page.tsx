"use client"

import { updateAnElection } from "@/actions/election/update-election"
import { Candidate, ElectionDocument, Position } from "@/app/models/Election"
import { ErrorMessages } from "@/components/error-messages"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns"
import {
  Archive,
  CalendarDays,
  Images,
  LoaderCircle,
  Minus,
  Plus,
  Scale,
  UserRoundPlus,
  X,
} from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import { useFieldArray, useForm, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"
import useSWR from "swr"

type CandidateWithFile = Omit<Candidate, "_id" | "image"> & {
    image?: string | ArrayBuffer | null
}

type PositionWithFileCandidates = Omit<Position, "_id" | "candidates"> & {
    candidates: CandidateWithFile[]
}

type ElectionFormInput = Omit<ElectionDocument, "status" | "bannerImage" | "positions"> & {
    bannerImage?: string | ArrayBuffer | null
    positions: PositionWithFileCandidates[]
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



const useEditElectionForm = () => {
  const pathname = usePathname()

  const { data, error, isLoading, mutate } = useSWR<ElectionDocument>(
    `/api/elections/${pathname.split("/").pop()}`,
    fetcher, {
      shouldRetryOnError: false
  }
)

    const [isPending, startTransition] = useTransition()
    const methods = useForm<ElectionFormInput>()

    const onSubmit = (formData: ElectionFormInput) => {
        startTransition(async () => {
            try {
                const res = await updateAnElection(formData)

                if (res?.success) {
                    mutate()
                    toast.success(res.message)
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

        // console.log(formData)
    }

    useEffect(()=>{
      if(data){
        methods.reset({
          _id: data?._id,
          name: data?.name,
          bannerImage: data?.bannerImage,
          desc: data?.desc,
          startDate: data?.startDate,
          endDate: data?.endDate,
          positions: data?.positions.map((position) => position),
        })
      }
    },[methods , data])


    return {
        methods,
        onSubmit: methods.handleSubmit(onSubmit),
        isCreatingElection: isPending,
        isLoading,
        error
    }
}

const EditElectionPositionCandidateForm = ({
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
      <div className="space-y-4 grid grid-cols-3 gap-2">
            {fields.length > 0 && (
                <Label className="font-semibold text-xl col-span-3">
                    Candidate(s)
                </Label>
            )}
            {fields.map((_, index) => {
                const candidateImage = watch(
                    `positions.${positionIndex}.candidates.${index}.image`
                )
                return (
                    <div
                        key={index}
                        className={`grid grid-cols-12 h-full gap-2 border rounded-lg p-4 relative`}
                    >
                        <div className="col-span-12 h-40 w-full rounded-t-xl group relative bg-accent border overflow-hidden flex items-center justify-center">
                            <Image
                                src={
                                    previewImages[index] || candidateImage as string ||
                                    "/images/no-image.png"
                                }
                                quality={100}
                                height={200}
                                width={200}
                                alt="candidaet-image"
                                className="group-hover:scale-105 duration-200 transition-transform object-contain"
                            />
                            <Button
                                type="button"
                                onClick={() =>
                                    inputUploadCandidateProfileRef.current?.click()
                                }
                                size="icon"
                                variant="outline"
                                className="rounded-full absolute bottom-2  left-4"
                            >
                                <Images />
                            </Button>
                            {candidateImage && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setValue(
                                            `positions.${positionIndex}.candidates.${index}.image`,
                                            ""
                                        )
                                    }}
                                    size="icon"
                                    variant="outline"
                                    className="rounded-full absolute bottom-2  right-4"
                                >
                                    <X />
                                </Button>
                            )}
                        </div>
                        <FormItem className="col-span-4 relative hidden">
                            <FormLabel className="sr-only">
                                Banner{" "}
                                <span className="text-destructive">*</span>
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

                                    const imageUrl = URL.createObjectURL(file)
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
                            className="col-span-12"
                        >
                            <FormField
                                control={control}
                                name={`positions.${positionIndex}.candidates.${index}.name`}
                                render={({ field: { value, onChange } }) => (
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
                                        {errors.positions?.[positionIndex]
                                            ?.candidates?.[index]?.name && (
                                            <span className="text-destructive">
                                                {
                                                    errors.positions[
                                                        positionIndex
                                                    ]?.candidates?.[index]?.name
                                                        .message
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
                                render={({ field: { value, onChange } }) => (
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
                                        {errors.positions?.[positionIndex]
                                            ?.candidates?.[index]?.bio && (
                                            <span className="text-destructive">
                                                {
                                                    errors.positions[
                                                        positionIndex
                                                    ]?.candidates?.[index]?.bio
                                                        .message
                                                }
                                            </span>
                                        )}
                                    </FormItem>
                                )}
                            />
                        </FormLabel>

                        <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            onClick={() => remove(index)}
                            className="rounded-full absolute top-2 right-2 shadow"
                        >
                            <Minus className="size-5" />
                        </Button>
                    </div>
                )
            })}
            {fields.length === 0 && (
                <div className="flex">
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
                    >
                        <UserRoundPlus /> Add Candidate
                    </Button>
                </div>
            )}
            {fields.length > 0 && (
                <div className="flex">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            append({
                                name: "",
                                bio: "",
                                image: "",
                            })
                        }
                        className="h-full w-full outline-dashed "
                    >
                        <UserRoundPlus /> Add Candidate
                    </Button>
                </div>
            )}
        </div>
    )
}

const EditElectionPositionForm = () => {
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
                    <li
                        key={index}
                        className={`grid grid-cols-12 gap-2 ${fields.length > 1 && "border bg-secondary/30 rounded-lg p-4"} relative`}
                    >
                        <FormLabel
                            htmlFor={`positions.${index}.numberOfWinners`}
                            className="col-span-2"
                        >
                            <FormField
                                control={control}
                                name={`positions.${index}.numberOfWinners`}
                                render={({ field: { value, onChange } }) => (
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
                                render={({ field: { value, onChange } }) => (
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
                                                        errors.positions[index]
                                                            ?.title?.message
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
                                render={({ field: { value, onChange } }) => (
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
                                                        ?.description?.message
                                                }
                                            </span>
                                        )}
                                    </FormItem>
                                )}
                            />
                        </FormLabel>
                        <FormLabel className="col-span-12 w-full">
                            <EditElectionPositionCandidateForm
                                positionIndex={index}
                            />
                        </FormLabel>
                        <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => remove(index)}
                            className="rounded-full absolute top-2 right-2 shadow"
                        >
                            <X className="size-10/12" />
                        </Button>

                        <FormLabel className="col-span-12 ml-auto">
                            {index === fields.length - 1 && (
                                <Button
                                    type="button"
                                    size="lg"
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
                                    <Plus /> Add Position
                                </Button>
                            )}
                        </FormLabel>
                    </li>
                )
            })}
        </ul>
    )
}

const EditElectionForm = ({
    isCreatingElection,
}: {
    isCreatingElection: boolean
}) => {
    const inputUploadBannerRef = useRef<HTMLInputElement>(null)
    const [previewBannerImage, setPreviewBannerImage] = useState<string>()
    const {
        control,
        watch,
        setValue,
        formState: { errors },
        clearErrors,
    } = useFormContext<ElectionFormInput>()
    const bannerImageUrlValue = watch("bannerImage")
    const startDateValue = watch("startDate")


    useEffect(() => {
        if (startDateValue) {
            setValue("endDate", addDays(startDateValue, 1))
            clearErrors("endDate")
        }
        if (!bannerImageUrlValue) setPreviewBannerImage("")
    }, [startDateValue, setValue, bannerImageUrlValue, clearErrors])

    return (
        <div className="grid grid-cols-12 gap-2">
            {errors && (
                <div className="sticky top-0 col-span-12 z-50 bg-secondary">
                    <ErrorMessages
                        errors={errors}
                        title="Heads Up!"
                        className="border-destructive text-base bg-destructive/20"
                    />
                </div>
            )}
            <div className="col-span-12 h-40 w-full rounded-t-xl group relative bg-accent border overflow-hidden flex items-center justify-center">
                <Image
                    src={previewBannerImage ||  bannerImageUrlValue as string || "/images/no-image.png"}
                    quality={100}
                    height={200}
                    width={200}
                    alt="banner-image"
                    className="group-hover:scale-105 duration-200 w-1/4 transition-transform object-cover"
                />
                <Button
                    type="button"
                    onClick={() => inputUploadBannerRef.current?.click()}
                    size="icon"
                    variant="outline"
                    className="rounded-full absolute top-2  left-4"
                >
                    <Images />
                </Button>
                {bannerImageUrlValue && <Button
                    type="button"
                    onClick={() => {
                        setValue("bannerImage", "")
                    }}
                    size="icon"
                    variant="outline"
                    className="rounded-full absolute top-2  right-4"
                >
                    <X />
                </Button>}
            </div>
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

                        // 1. Edit object URL for preview (memory management)
                        const imageUrl = URL.createObjectURL(file)
                        setPreviewBannerImage(imageUrl)

                        // 2. Convert to Base64 for form storage
                        const reader = new FileReader()
                        reader.onload = () => {
                            const base64Image = reader.result as string
                            setValue("bannerImage", base64Image)
                        }
                        reader.readAsDataURL(file)

                        // 3. Cleanup function (moved outside to avoid immediate execution)
                        return () => {
                            URL.revokeObjectURL(imageUrl) // Free memory when component unmounts or image changes
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
            <FormField
                control={control}
                name="startDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col col-span-12 md:col-span-4">
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
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <FormDescription>
                            Enter the date of the election.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="endDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col col-span-12 md:col-span-4 ">
                        <FormLabel>
                            Election End Date{" "}
                            <span className="text-destructive">*</span>
                        </FormLabel>
                        <Popover>
                            <PopoverTrigger asChild disabled>
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
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date > new Date()}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <FormDescription>
                            Enter the date of the election.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormItem className="col-span-12">
                <EditElectionPositionForm />
            </FormItem>
            <FormItem className="col-span-12">
                <Button type="submit" disabled={isCreatingElection}>
                    {isCreatingElection ? (
                        <LoaderCircle className="animate-spin" />
                    ) : (
                        <>
                            <Archive />
                            <span>Edit Election</span>
                        </>
                    )}
                </Button>
            </FormItem>
        </div>
    )
}

const EditElectionPage = () => {
    const { methods, onSubmit, isCreatingElection , isLoading , error } = useEditElectionForm()

    if (isLoading)
      return (
          <div className="h-full w-full flex items-center justify-center">
              <LoaderCircle className="animate-spin size-10" />
          </div>
      )

  if (error) return <ErrorMessages errors={error} />

    return (
        <div className="h-screen w-full flex flex-col gap-4">
            <div>
                <h3 className="scroll-m-20 text-lg font-semibold tracking-tight">
                    Edit an Election
                </h3>
                <p className="leading-7 text-md text-muted-foreground">
                    Configure your election parameters and launch the voting
                    process.
                </p>
            </div>
            <Form {...methods}>
                <form onSubmit={onSubmit}>
                    <EditElectionForm
                        isCreatingElection={isCreatingElection}
                    />
                </form>
            </Form>
        </div>
    )
}

export default EditElectionPage
