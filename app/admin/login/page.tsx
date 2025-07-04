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
import { Eye, EyeOff, LoaderCircle } from "lucide-react"
import { signIn as signInAction } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"
import { UserDocument } from "../../models/User"
const useLoginForm = () => {
    const router = useRouter()
    const [isOngoing, startTransition] = useTransition()
    const methods =
        useForm<
            Omit<
                UserDocument,
                "_id" | "name" | "image" | "createdAt" | "updatedAt"
            >
        >()

    const onSubmit = (
        formData: Omit<
            UserDocument,
            "_id" | "name" | "image" | "createdAt" | "updatedAt"
        >
    ) => {
        startTransition(async () => {
          const res = await signInAction("admin", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            })

            if (res?.ok) {
                router.push("/admin/dashboard")
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
        <div className="flex flex-col gap-4">
            <FormField
                control={control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input
                                autoComplete="off"
                                placeholder="example@example.com"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>{`Enter your email.`}</FormDescription>
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
                                    placeholder="******"
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
                            {`Enter your password.`}
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
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
        <div className="h-screen flex items-center justify-center">
            <div className="bg-secondary/40  flex w-2/3 rounded-xl overflow-hidden border">
                <div className="w-full md:w-1/2 py-10 px-6 flex flex-col gap-5 ">
                    <div className="text-center">
                        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            Log in to your Account.
                        </h3>
                        <p className="leading-4 [&:not(:first-child)]:mt-1">
                            Sign In to Access Your Voting Portal
                        </p>
                    </div>
                    <Form {...methods}>
                        <form onSubmit={handleSubmit}>
                            <LoginForm isLoggingIn={isLoggingIn} />
                        </form>
                    </Form>
                    <div className="flex items-center justify-start">
                        <p className="leading-7 [&:not(:first-child)]:mt-6">
                            {`Don't have an account?`}
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
                <div className="hidden md:block w-1/2 bg-accent">
                    <HeroSection />
                </div>
            </div>
        </div>
    )
}

export default LoginPage
