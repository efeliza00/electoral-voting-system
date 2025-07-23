"use client"
import { updateAccountProfileImage } from "@/app/actions/account/update-account-profile-image"
import { verifyEmail } from "@/app/actions/account/verify-email"
import Loader from "@/components/loader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


import { BadgeCheck, Loader2, RefreshCw, UserRound } from "lucide-react"

import { useSession } from "next-auth/react"
import { useRef, useTransition } from "react"
import toast from "react-hot-toast"

const AccountDetails = () => {
  const { status, data: session, update } = useSession()
  const fileUploadRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [isPendingVerifyEmail, startEmailVerifyTransition] = useTransition()

  if (status === "loading") {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <>
      <div className="bg-card rounded-lg p-6 space-y-6">
        <div className="relative flex flex-col items-center space-y-4">
          <Avatar className="size-36 border border-accent ring-2 ring-primary/10">
            <AvatarImage
              src={session?.user?.image as string}
              alt={`${session?.user?.name}-profile-image`}
            />
            <AvatarFallback className="bg-accent text-primary">
              <UserRound className="w-1/2 h-30" />
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            size="icon"
            onClick={() => fileUploadRef.current?.click()}
            className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Input
            ref={fileUploadRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return

              const reader = new FileReader()
              reader.readAsDataURL(file)
              reader.onload = () => {
                const base64Image =
                  reader.result as string
                startTransition(async () => {
                  const res = await updateAccountProfileImage({ _id: session?.user?.id as string, profileImageUrl: base64Image })
                  if (res?.success) {
                    await update({
                      ...session,
                      user: {
                        ...session?.user,
                        image: res?.data
                      }
                    })
                    toast.success(res?.message)
                  } else {
                    toast.error(`${res?.error}`)
                  }
                })
              }

            }}
          />
        </div>


        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Name</h3>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">Your Full Name</p>
                </div>
              </div>
            </div>


            <div className="space-y-2">
              <h3 className="font-medium">Email Verification</h3>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{session?.user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user.isEmailVerified
                      ? "Your email is verified"
                      : "Please verify your email address"}
                  </p>
                </div>
                {!session?.user.isEmailVerified ? (
                  <Button
                    variant="default"
                    size="sm"
                    disabled={session?.user.isEmailVerified}
                    onClick={() => {
                      startEmailVerifyTransition(async () => {
                        const res = await verifyEmail(session?.user?.email as string)
                        if (res?.message) {
                          toast.success(res.message)
                        } else {
                          toast.error(res?.error || "Verification failed")
                        }
                      })
                    }}
                  >
                    {isPendingVerifyEmail ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      "Verify Email"
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center text-sm text-green-600">
                    <BadgeCheck className="h-5 w-5 mr-1" />
                    Verified
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AccountDetails