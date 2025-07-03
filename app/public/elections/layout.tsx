import { VoterProvider as SessionProvider } from "@/lib/providers/session-provider"



const PublicElectionsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>{children}</SessionProvider>
  )
}

export default PublicElectionsLayout