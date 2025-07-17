import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "5mb",
        },
    },

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
            },
        ],
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
