"use client"

import { verifyOtp } from "@/app/actions/account/verify-otp"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { useForm, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"
import { Button } from "./ui/button"
import {
  Form,
  FormControl, FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "./ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp"

 

const useVerifyEmailForm = () => {
    const searchParams = useSearchParams()
    const { update } = useSession()
    const router = useRouter()
    const token = searchParams?.get("token")
    const [isOngoing, startTransition] = useTransition()


    const methods = useForm({
        mode: "onChange",
        defaultValues: {
            otp: "",
        },
    })

    const onSubmit = (
        formData: {otp:string}
    ) => {
        startTransition(async () => {
            const res = await verifyOtp({otp: formData.otp, token: String(token)})

            if (res?.error) {
                toast.error(res?.error as string) 
               
            } else {
              update()
                toast.success(res?.message as string)
                 router.push("/admin/login")
            }
        })
    }

    return {
        methods,
        onSubmit,
        isOngoing
    }
}

const VerifyEmailForm = () => {
    const { isOngoing } = useVerifyEmailForm()
    const { control } = useFormContext()
    return (
        <div className="w-full md:w-1/2 space-y-4 flex items-center justify-center flex-col">
            <FormField
                control={control}
                name="otp"
                render={({ field }) => (
                    <FormItem className="w-full flex flex-col items-center justify-center">
                        <FormLabel className="sr-only">OTP</FormLabel>
                        <FormControl>
                            <InputOTP maxLength={6} {...field}>
                                <InputOTPGroup >
                                    <InputOTPSlot index={0} className="size-12 sm:size-16 text-xl sm:text-2xl"/>
                                    <InputOTPSlot index={1} className="size-12 sm:size-16 text-xl sm:text-2xl"/>
                                    <InputOTPSlot index={2} className="size-12 sm:size-16 text-xl sm:text-2xl"/>
                                    <InputOTPSlot index={3} className="size-12 sm:size-16 text-xl sm:text-2xl"/>
                                    <InputOTPSlot index={4} className="size-12 sm:size-16 text-xl sm:text-2xl"/>
                                    <InputOTPSlot index={5} className="size-12 sm:size-16 text-xl sm:text-2xl"/>
                                </InputOTPGroup>
                            </InputOTP>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <Button type="submit" className="w-full max-w-xs" disabled={isOngoing}>
                {isOngoing ? <Loader2 className="animate-spin" /> : "Submit"}
            </Button>
        </div>
    )
}

const VerifyEmail = () => {
    const { methods, onSubmit } = useVerifyEmailForm()
    return (
        <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <div className="h-screen p-4 my-28 md:p-0">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <h1 className="text-3xl md:text-4xl text-primary font-light leading-snug">
                            Enter OTP
                        </h1>
                        <p className="text-muted-foreground">
                            We&apos;ve sent a 6-digit verification code to your email. Please enter it below.
                        </p>

                        <VerifyEmailForm />
                    </div>
                </div>
            </form>
        </Form>
    )
}

export default VerifyEmail
