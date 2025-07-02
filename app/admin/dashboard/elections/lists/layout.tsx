import { LoaderCircle } from "lucide-react"
import { Suspense } from "react"

const ElectionListLayout = ({ children }: { children: React.ReactNode }) => {
    return (
      <Suspense fallback={<div className="h-full w-full flex items-center justify-center">
        <LoaderCircle className="animate-spin size-10" />
      </div>}>
        <div className="h-screen w-full flex flex-col gap-4">
            <div className="border-b pb-1">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    Election Lists
                </h3>
                <p className="leading-7 text-muted-foreground">
                    Configure elections before the voting proccess starts.
                </p>
            </div>
            {children}
        </div>
      </Suspense>

    )
}

export default ElectionListLayout
