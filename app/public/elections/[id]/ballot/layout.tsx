import { VoterProvider as SessionProvider } from "@/lib/providers/session-provider"



const BallotElectionsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>{children}</SessionProvider>
  )
}

export default BallotElectionsLayout