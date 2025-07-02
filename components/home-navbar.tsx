"use client"

import Image from "next/image"
import Link from "next/link"

const HomeNavbar = () => {
    return (
        <div className="border-b w-full flex items-center justify-between px-6 py-4">
            <Link href="/">
                <Image
                    src="/images/logo.png"
                    alt="logo"
                    width={100}
                    height={100}
                />
            </Link>
        </div>
    )
}

export default HomeNavbar
