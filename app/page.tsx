import Features from "@/components/sections/landing-page/features/feature";
import Footer from "@/components/sections/landing-page/footer/footer";
import Navbar from "@/components/sections/landing-page/header/navbar";
import Hero from "@/components/sections/landing-page/hero/hero-section";
import { AdminProvider } from "@/lib/providers/session-provider";


export default function Home() {
  return <>
    <AdminProvider>
      <Navbar />
    </AdminProvider>
    <Hero />
    <Features />
    <Footer />

  </>
}
