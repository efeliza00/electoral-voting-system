"use client"

import { signUp } from "@/actions/auth/actions"
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
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"
import { UserDocument } from "../models/User"
const useSignupForm = () => {
    const methods =
        useForm<
            Omit<UserDocument, "_id" | "image" | "createdAt" | "updatedAt">
        >()

    const onSubmit = async (
        formData: Omit<
            UserDocument,
            "_id" | "image" | "createdAt" | "updatedAt"
        >
    ) => {
        const res = await signUp(formData)

        if (res?.error) {
            toast.error(res?.error as string)
        } else {
            toast.success("Account was created successfully!")
        }
    }

    return {
        methods,
        onSubmit,
    }
}

const SignupForm = () => {
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false)
    const { control } = useFormContext()

    return (
        <div className="grid grid-cols-2 gap-4 grid-auto-flow">
            {/* <FormItem className="relative">
                <FormLabel className="sr-only">Profile</FormLabel>
                <Image
                    src={profileImage}
                    alt="profile-image"
                    height={100}
                    width={100}
                    className="rounded-full ring-primary ring-2 ring-offset-2"
                />
                <FormLabel
                    htmlFor="profile-image"
                    className="absolute bottom-0 mx-auto border rounded-full p-1 bg-accent hover:bg-accent-foreground hover:text-secondary transition-colors duration-200"
                >
                    <Camera />
                    <Input
                        type="file"
                        accept="image/*"
                        id="profile-image"
                        {...register("image")}
                        className="hidden"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const files = e.target?.files
                            if (!files) return

                            const file = e.target.files?.[0]
                            if (file) {
                                const reader = new FileReader()
                                reader.readAsDataURL(file)

                                reader.onload = async () => {
                                    const base64Image = reader.result
                                    setValue("image", base64Image)
                                }
                            }
                        }}
                    />
                </FormLabel>
            </FormItem> */}

            <FormField
                control={control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input autoComplete="off" {...field} />
                        </FormControl>
                        <FormDescription>{`Enter your name.`}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
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
                            {`Enter your password`}
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <Button type="submit" className="w-full col-span-2">
                Create Account
            </Button>
        </div>
    )
}

const SignupPage = () => {
    const { methods, onSubmit } = useSignupForm()
    const router = useRouter()
    return (
        <div className="h-screen flex items-center justify-center">
            <div className="bg-secondary/40  flex w-2/3 rounded-xl overflow-hidden border">
                <div className="w-full md:w-2/3 px-6 py-10 md:py-0 flex flex-col gap-5 items-center justify-center">
                    <div className="text-center">
                        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            Create an Account.
                        </h3>
                        <p className="leading-4 [&:not(:first-child)]:mt-1">
                            Register to manage Elections
                        </p>
                    </div>
                    <Form {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)}>
                            <SignupForm />
                        </form>
                    </Form>
                    <div className="flex items-center justify-start">
                        <p className="leading-7 [&:not(:first-child)]:mt-6">
                            Already have an account?
                        </p>
                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => router.push("/login")}
                        >
                            Login
                        </Button>
                    </div>
                </div>
                <div className="hidden md:block w-1/3 bg-accent">
                    <HeroSection />
                </div>
            </div>
        </div>
    )
}

export default SignupPage
