import Features from "@/components/sections/landing-page/features/feature";
import Footer from "@/components/sections/landing-page/footer/footer";
import Navbar from "@/components/sections/landing-page/header/navbar";
import Hero from "@/components/sections/landing-page/hero/hero-section";
import TotalElections from "@/components/sections/landing-page/total-elections/total-elections";
import { AdminProvider } from "@/lib/providers/session-provider";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export const dynamic = 'force-dynamic'; // Ensure dynamic fetching

export default function Home() {
  return (
    <>
      <AdminProvider>
        <Navbar />
      </AdminProvider>
      <Hero />
      <Suspense fallback={<ElectionsCountLoader />}>
        <TotalElections />
      </Suspense>
      <Features />
      <Footer />
    </>
  );

}

function ElectionsCountLoader() {
  return (
    <div className="flex items-center py-20 justify-center">
      <Loader2 className="text-primary animate-spin size-26" />
    </div>
  );
}