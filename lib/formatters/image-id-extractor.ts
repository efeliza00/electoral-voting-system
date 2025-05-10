export const imageIdExtractor = (secureUrl: string) => {
    const parts = secureUrl.split("/upload/")[1]
    const withoutVersion = parts.split("/").slice(1).join("/")
    const publicId = withoutVersion.replace(/\.[^/.]+$/, "")
    return publicId
}
