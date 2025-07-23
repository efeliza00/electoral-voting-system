import Image from "next/image"
import { Ripple } from "./magicui/ripple"
const HeroSection = () => {
    return (
      <div className="relative flex h-[600px]  w-full flex-col items-center justify-center bg-background">
        <Image
          src={"/images/logo-icon.png"}
          height={100}
          width={100}
                alt="logo-image"
          quality={100}
          className="size-36 z-50"

            />
        <Ripple />
        </div>
    )
}

export default HeroSection
