import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // Using shadcn/ui style
import { TriangleAlert } from "lucide-react"
import { FieldErrors } from "react-hook-form"
import { ScrollArea } from "./ui/scroll-area"

interface ErrorMessagesProps {
    errors?: FieldErrors | Record<string, string>
    title?: string
    className?: string
}

export function ErrorMessages({
    errors,
    title = "Please fix the following errors",
    className = "",
}: ErrorMessagesProps) {
    if (!errors || Object.keys(errors).length === 0) return null

    return (
        <Alert variant="destructive" className={className}>
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                <ScrollArea className="max-h-[4rem] w-full">
                    <ul className="list-disc pl-5 space-y-1">
                        {Object.entries(errors).map(([field, error]) => (
                            <li key={field}>
                                <span className="font-medium capitalize">
                                    {field}
                                </span>
                                :{" "}
                                {typeof error === "object"
                                    ? error.message
                                    : String(error)}
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </AlertDescription>
        </Alert>
    )
}
