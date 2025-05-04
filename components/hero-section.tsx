import Image from "next/image"
import { Ripple } from "./magicui/ripple"

const HeroSection = () => {
  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center bg-background">
      <Image src={"/images/logo.png"} height={100} width={100} alt="logo-image" className="animate-pulse"/>
      <Ripple />
    </div>
  )
}

export default HeroSection