import Footer from "@/components/sections/landing-page/footer/footer";
import HeaderNavbarPublic from "@/components/sections/landing-page/header/navbar-public";
import { VoterProvider as SessionProvider } from "@/lib/providers/session-provider";



const PublicElectionsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <HeaderNavbarPublic />
    <SessionProvider>{children}</SessionProvider>
      <Footer />
    </>
  )
}

export default PublicElectionsLayout