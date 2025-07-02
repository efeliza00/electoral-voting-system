import { AdminProvider as SessionProvider } from "@/lib/providers/session-provider"
export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return <SessionProvider >{children}</SessionProvider>
}
