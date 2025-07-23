import User from "@/app/models/User";
import ChangePassword from "@/components/change-password";
import InvalidAccess from "@/components/invalid-access";
import ResetPassword from "@/components/reset-password";
import Footer from "@/components/sections/landing-page/footer/footer";
import HeaderNavbarPublic from "@/components/sections/landing-page/header/navbar-public";
import connectDB from "@/lib/mongodb";
import { SearchParams } from "next/dist/server/request/search-params";
interface ResetPasswordPageProps {
  searchParams: Promise<SearchParams>
}

const ResetPasswordPage = async ({ searchParams }: ResetPasswordPageProps) => {
  await connectDB()
  const { token } = await searchParams

  if (token) {
    const user = await User.findOne({ resetPasswordToken: token })


    if (!user) {
      return <>
        <InvalidAccess />
        <Footer />
      </>
    }
    return <><ChangePassword />
      <Footer /></>
  } else {
    return <>
      <HeaderNavbarPublic />
      <ResetPassword />
      <Footer />
    </>
  }
}

export default ResetPasswordPage