

const PublicElectionPageLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <div className='min-h-sceen container p-4 md:p-0 w-full md:max-w-4xl mx-auto'>{children}</div>
  )
}

export default PublicElectionPageLayout