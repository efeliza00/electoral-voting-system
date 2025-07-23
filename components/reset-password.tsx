"use client"

import { resetPassword } from "@/app/actions/account/reset-password"
import { CircleCheck, Loader2 } from "lucide-react"
import Image from "next/image"
import { useState, useTransition } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
const ResetPassword = () => {
  const [ message , setMessage ] = useState<string>("")
 const [ email , setEmail ] = useState<string>("")
  const [ isPending , startTransition ] = useTransition()
  const handleSubmit  = () => { 
    startTransition(async () => { 
      const message  = await resetPassword(email)
      setMessage(String(message))
      setEmail("")
    })
  }

  return (
    <div className="flex h-screen items-center p-4 md:p-0  justify-center space-y-4 flex-col">
      <Image src="/images/reset-password/reset-password.svg" width={100} height={100} alt="reset-password-logo" className="size-36"/>
      <h1 className="text-5xl font-light leading-snug text-primary">Reset Password</h1>
      <p className="text-muted-foreground tracking-wide">Please enter your email address to receive a link to reset your password.</p>
      {message && <div className="bg-green-500 text-primary-foreground gap-2 flex items-center w-full md:w-1/3 px-2 py-4 rounded-lg shadow border "><CircleCheck /> {message}</div>}
     <div className="w-full md:w-1/3 md:gap-0 gap-4 flex flex-col md:flex-row"> <Input type="email" placeholder="Your email"  value={email} onChange={(e) => setEmail(e.target.value)} className="md:rounded-r-none h-12"/>
      <Button onClick={handleSubmit} disabled={isPending}  className="md:rounded-l-none h-12 shadow">
        {isPending ? <Loader2 className="animate-spin size-8" /> : "Reset Password"}
      </Button></div>

    </div>
  )
}

export default ResetPassword