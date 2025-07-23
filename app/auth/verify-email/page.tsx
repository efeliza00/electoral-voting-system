import User from "@/app/models/User";
import InvalidAccess from "@/components/invalid-access";
import Footer from "@/components/sections/landing-page/footer/footer";
import VerifyEmail from "@/components/verify-email";
import connectDB from "@/lib/mongodb";
import { AdminProvider } from "@/lib/providers/session-provider";
import { SearchParams } from "next/dist/server/request/search-params";
interface VerifyEmailPageProps {
  searchParams: Promise<SearchParams>
}

const VerifyEmailPage = async ({ searchParams }: VerifyEmailPageProps) => {
  await connectDB()
  const { token } = await searchParams

  if (token) {
    const user = await User.findOne({ emailVerificationToken: token })


    if (!user) {
      return <>
        <InvalidAccess />
        <Footer />
      </>
    }
    return <AdminProvider><VerifyEmail />
      <Footer /></AdminProvider>
  } 
  
}

export default VerifyEmailPage