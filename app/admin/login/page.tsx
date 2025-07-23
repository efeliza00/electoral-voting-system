"use client"

import HeroSection from "@/components/hero-section"
import { Button } from "@/components/ui/button"
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
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, LoaderCircle } from "lucide-react"
import { signIn as signInAction } from "next-auth/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import { UserDocument } from "../../models/User"


const useLoginForm = () => {
    const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callback") ?? "/admin/dashboard"
  const decodedUrl = decodeURIComponent(callbackUrl)
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
    });
  const loginZodSchema = z
    .object({
      password: passwordSchema,
      email: z.string().email("Invalid email address"),
    })



    const methods =
        useForm<
            Omit<
                UserDocument,
              "_id" | "name" | "image" | "createdAt" | "updatedAt" | "resetPasswordToken" | "resetPasswordExpiry" | "emailVerificationToken" | "isEmailVerified"
            >
        >({
          mode: "onChange",
          resolver: zodResolver(loginZodSchema),
          defaultValues: {
            password: "",
            email: "",
          },
        })

    const onSubmit = (
        formData: Omit<
            UserDocument,
          "_id" | "name" | "image" | "createdAt" | "updatedAt" | "resetPasswordToken" | "resetPasswordExpiry" | "emailVerificationToken" | "isEmailVerified"
        >
    ) => {
        startTransition(async () => {
          const res = await signInAction("admin", {
                email: formData.email,
            password: formData.password,
            redirect: false,
            })

          if (res?.ok) {
            router.push(decodedUrl)
                toast.success("Login Successful!")
            } else {
                toast.error(res?.error as string)
            }
        })
    }

    return {
        methods,
        handleSubmit: methods.handleSubmit(onSubmit),
        isLoggingIn: isOngoing,
    }
}

const LoginForm = ({ isLoggingIn }: { isLoggingIn: boolean }) => {
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false)
    const { control } = useFormContext()

    return (
      <div className="flex flex-col gap-4 mt-4">
            <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                        <FormControl>
                            <Input
                        className="h-10"
                        autoComplete="off"
                                {...field}
                            />
                        </FormControl>
                    <FormDescription >
                      Enter your email.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormLabel htmlFor="password" className="relative">
                            <FormControl>
                        <Input
                                    autoComplete="off"
                                    type={isShowPassword ? "text" : "password"}

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
                        <FormDescription>
                      Enter your password.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        <Button
          type="submit"
          className="w-full mt-6 h-11"
          disabled={isLoggingIn}
        >
                {isLoggingIn ? (
                    <LoaderCircle className="animate-spin" />
                ) : (
                    <span>Login</span>
                )}
            </Button>
        </div>
    )
}

const LoginPage = () => {
    const { methods, handleSubmit, isLoggingIn } = useLoginForm()
    const router = useRouter()
    return (
      <div className="h-screen flex items-center p-4 md:p-0 justify-center">
        <div className="bg-muted   flex w-full md:w-3/5 rounded-xl shadow md:border-t-0 border-t-8 border-t-primary overflow-hidden border">
          <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col gap-5 ">
                    <div className="text-center">
              <h3 className="scroll-m-20 text-3xl md:text-4xl font-light tracking-tight text-primary">
                            Log in to your Account.
              </h3>
                    </div>
                    <Form {...methods}>
                        <form onSubmit={handleSubmit}>
                            <LoginForm isLoggingIn={isLoggingIn} />
                        </form>
                    </Form>
            <Link href="/auth/reset-password" className="text-muted-foreground hover:text-primary">
              Forgot your Password?
            </Link>
                    <div className="flex items-center justify-start">
                        <p className="leading-7 [&:not(:first-child)]:mt-6">
                Don&apos;t have an account?
                        </p>
                        <Button
                            variant="link"
                            size="sm"
                onClick={() => router.push("/admin/signup")}
                            className="cursor-pointer"
                        >
                            Signup
                        </Button>
                    </div>
                </div>

          <div className="hidden md:flex items-center justify-center w-1/2 h-full bg-accent">
                    <HeroSection />
                </div>
            </div>
        </div>
    )
}

export default LoginPage
