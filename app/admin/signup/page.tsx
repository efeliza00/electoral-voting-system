"use client"

import { signUp } from "@/app/actions/auth/signup"
import { UserDocument } from "@/app/models/User"
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
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"


const useSignupForm = () => {
  const [isPending, startTransition] = useTransition()
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

  const signupZodSchema = z
    .object({
      name: z.string().min(1, "Name is required"),
      password: passwordSchema,
      confirmPassword: passwordSchema,
      email: z.string().email("Invalid email address"),
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
      path: ["confirmPassword"],
      message: "Password didn't match.",
    });

  const methods =
    useForm({
      mode: "onChange",
      resolver: zodResolver(signupZodSchema),
      defaultValues: {
        name: "",
        password: "",
        confirmPassword: "",
        email: "",
      },
    })
  const onSubmit = (
      formData: Omit<
        UserDocument,
        "_id" | "image" | "createdAt" | "updatedAt" | "resetPasswordToken" | "resetPasswordExpiry" | "emailVerificationToken" | "isEmailVerified" 
      >
    ) => {

    startTransition(async () => {
      const res = await signUp(formData)

        if (res?.error) {
            toast.error(res?.error as string)
        } else {
            toast.success("Account was created successfully!")
        }
    })
  }

    return {
        methods,
        onSubmit,
      isPending 
    }
}

const SignupForm = () => {
  const { isPending } = useSignupForm()
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false)
    const { control } = useFormContext()

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">Name</FormLabel>
                        <FormControl>
                      <Input
                        className="h-10"
                        autoComplete="off"
                        {...field}
                      />
                        </FormControl>
                    <FormDescription >
                      Enter your name.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
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
        <FormField
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormLabel htmlFor="confirmPassword" className="relative">
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
                Confirm your password.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        <Button type="submit" disabled={isPending} className="col-span-full">
          {isPending && <Loader2 className="mr-2 h-6 w-6 animate-spin" />} Create Account
            </Button>
        </div>
    )
}

const SignupPage = () => {
    const { methods, onSubmit } = useSignupForm()
    const router = useRouter()
    return (
      <div className="h-screen flex items-center  p-4 md:p-0 justify-center">
        <div className="bg-muted flex md:w-2/3 w-full rounded-xl shadow md:border-t-0 border-t-8 border-t-primary overflow-hidden border">
          <div className="w-full md:w-2/3 p-12 md:p-16 space-y-4">
                    <div className="text-center">
              <h3 className="scroll-m-20 text-3xl md:text-4xl font-light text-primary tracking-tight">
                            Create an Account.
                        </h3>
              <p className="leading-4 [&:not(:first-child)]:mt-1 text-muted-foreground">
                Register to and start officiating your election
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
                onClick={() => router.push("/admin/login")}
                        >
                            Login
                        </Button>
                    </div>
                </div>
          <div className="hidden md:flex w-1/3 bg-accent">
                    <HeroSection />
                </div>
            </div>
        </div>
    )
}

export default SignupPage
