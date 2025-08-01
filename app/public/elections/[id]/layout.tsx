

const PublicElectionPageLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <div className='min-h-sceen container w-full md:max-w-4xl mx-auto'>{children}</div>
  )
}

export default PublicElectionPageLayout