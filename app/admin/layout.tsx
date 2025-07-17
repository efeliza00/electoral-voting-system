import Loader from "@/components/loader"
import { AdminProvider as SessionProvider } from "@/lib/providers/session-provider"
import { Suspense } from "react"
export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
  return <SessionProvider ><Suspense fallback={<Loader />}>{children}</Suspense></SessionProvider>
}
