import Footer from "@/components/sections/landing-page/footer/footer"
import HeaderNavbar from "@/components/sections/landing-page/header/navbar"
import { AdminProvider } from "@/lib/providers/session-provider"



const AboutPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <> <AdminProvider>
      <HeaderNavbar />
    </AdminProvider>{children}<Footer/></>
  )
}

export default AboutPageLayout