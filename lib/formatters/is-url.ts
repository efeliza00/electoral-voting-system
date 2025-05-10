export const isUrl = (value: string): boolean => {
    try {
        new URL(value)
        return true
    } catch (error) {
        console.log("is URL:", error)
        return false
    }
}
