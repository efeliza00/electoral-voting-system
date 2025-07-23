import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"

const InvalidAccess= () => {
  return (
    <div className='h-screen w-full flex flex-col items-center justify-center'>
      <Image src={"/images/reset-password/invalid.svg"} width={100} height={100} alt="invalid-access" className="size-36"/>
      <h1 className="text-5xl text-primary mt-5">Invalid Token</h1>
      <p className="text-muted-foreground"> You must have a valid access token in order to continue. Please Try again.</p>
      <Button asChild><Link href="/admin/login"> <ArrowLeft/> Go back to Login</Link></Button>
    </div>
  )
}

export default InvalidAccess