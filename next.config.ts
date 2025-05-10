import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
        ],
    },
    experimental: {
        esmExternals: "loose",
    },
    serverExternalPackages: ["mongoose"],
    webpack: (config) => {
        config.experiments = {
            layers: true,
            topLevelAwait: true,
        }
        return config
    },
}

export default nextConfig
