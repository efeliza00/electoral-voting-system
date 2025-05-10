const ElectionListLayout = ({ children }: { children: React.ReactNode }) => {
    return (
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
    )
}

export default ElectionListLayout
