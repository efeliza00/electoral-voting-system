"use client"

import { changePassword } from "@/app/actions/account/change-password"
import { UserDocument } from "@/app/models/User"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import { Button } from "./ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"

 

const useChangePasswordForm = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams?.get("token")
    const [isOngoing, startTransition] = useTransition()

    const passwordSchema = z
    .string({
        required_error: "Password can not be empty.",
    })
    .regex(/^.{8,20}$/, {
        message: "Minimum 8 and maximum 20 characters.",
    })
    .regex(/(?=.*[A-Z])/, {
        message: "At least one uppercase character.",
    })
    .regex(/(?=.*[a-z])/, {
        message: "At least one lowercase character.",
    })
    .regex(/(?=.*\d)/, {
        message: "At least one digit.",
    })
    .regex(/[$&+,:;=?@#|'<>.^*()%!-]/, {
        message: "At least one special character.",
    })

const signupZodSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: passwordSchema,
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
        path: ["confirmPassword"],
        message: "Password didn't match.",
    })

    const methods = useForm({
        mode: "onChange",
        resolver: zodResolver(signupZodSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    const onSubmit = (
        formData: Omit<
            UserDocument,
            | "_id"
            | "image"
            | "createdAt"
            | "updatedAt"
            | "resetPasswordToken"
            | "resetPasswordExpiry"
            | "name"
            | "email"
        >
    ) => {
        startTransition(async () => {
            const res = await changePassword({
                password: formData.password,
                resetPasswordToken: String(token),
            })

            if (res?.error) {
                toast.error(res?.error as string) 
               
            } else {
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

const ChangePasswordForm = () => {
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false)
    const { isOngoing } = useChangePasswordForm()
    const { control } = useFormContext()
    return (
        <div className=" w-1/2 space-y-4">
            <FormField
                control={control}
                name="password"
                render={({ field }) => (
                    <FormItem className="w-full">
                        <FormLabel>Password</FormLabel>
                        <FormLabel htmlFor="password" className="relative">
                            <FormControl>
                                <Input
                                    autoComplete="off"
                                    type={isShowPassword ? "text" : "password"}
                                    className="h-12"
                                    {...field}
                                />
                            </FormControl>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute bg-inherit hover:bg-inherit top-0 right-0 "
                                onClick={() =>
                                    setIsShowPassword((prevState) => !prevState)
                                }
                            >
                                {isShowPassword ? <Eye /> : <EyeOff />}
                            </Button>
                        </FormLabel>
                        <FormDescription>Enter your password.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                    <FormItem className="w-full">
                        <FormLabel>Confirm Password</FormLabel>
                        <FormLabel
                            htmlFor="confirmPassword"
                            className="relative"
                        >
                            <FormControl>
                                <Input
                                    autoComplete="off"
                                    type={isShowPassword ? "text" : "password"}
                                    {...field}
                                    className="h-12"
                                />
                            </FormControl>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute bg-inherit hover:bg-inherit top-0 right-0 "
                                onClick={() =>
                                    setIsShowPassword((prevState) => !prevState)
                                }
                            >
                                {isShowPassword ? <Eye /> : <EyeOff />}
                            </Button>
                        </FormLabel>
                        <FormDescription>
                            Confirm your password.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <Button type="submit" className="w-full" disabled={isOngoing}>
                {isOngoing ? <Loader2 className="animate-spin" /> : "Change Password"}
            </Button>
        </div>
    )
}

const ChangePassword = () => {
    const { methods, onSubmit } = useChangePasswordForm()
    return (
        <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <div className="h-screen p-4 my-28 md:p-0">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <h1 className="text-3xl md:text-4xl text-primary font-light leading-snug">
                            Create a New Password
                        </h1>
                        <p className="text-muted-foreground">
                            Please enter your new password to start managing
                            elections again.
                        </p>

                        <ChangePasswordForm />
                    </div>
                </div>
            </form>
        </Form>
    )
}

export default ChangePassword
