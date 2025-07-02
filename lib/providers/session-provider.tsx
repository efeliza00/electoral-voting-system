"use client"

import { SessionProvider } from "next-auth/react"

type Props = {
    children?: React.ReactNode
}

export const AdminProvider = ({ children }: Props) => {
  return <SessionProvider basePath="/api/admin-auth">{children}</SessionProvider>
}
export const VoterProvider = ({ children }: Props) => {
  return <SessionProvider basePath="/api/voter-auth">{children}</SessionProvider>
}

