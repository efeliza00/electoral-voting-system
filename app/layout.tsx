import featuresData from '@/components/sections/landing-page/features/feature-data'
import '@schedule-x/theme-default/dist/index.css'
import type { Metadata } from "next"
import { Toaster } from "react-hot-toast"
import "./globals.css"


export const metadata: Metadata = {
  title: {
    default: "VoteBuddy | Secure Electoral Voting System",
    template: "%s | VoteBuddy"
  },
  description: "Empower your organization with VoteBuddy - the intuitive voting platform for student councils, school polls, and group decisions. Tamper-proof voting with instant results.",
  keywords: [
    "online voting",
    "student council elections",
    "school voting system",
    "secure polls",
    "election software",
    "voting app",
    "group decision tool"
  ],
  applicationName: "VoteBuddy",
  authors: [{ name: "Evan Feliza", url: "https://www.linkedin.com/in/evan-feliza-507184245/" }],
  creator: "Evan Feliza",
  classification: "SaaS Voting Platform",
  openGraph: {
    title: "VoteBuddy | Modern Voting Solution",
    description: "Streamline your elections with our secure, user-friendly voting platform for schools and organizations.",
    url: "https://votebuddy.app",
    siteName: "VoteBuddy",
    images: [
      {
        url: "https://votebuddy.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VoteBuddy Voting Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  themeColor: '#6366f1',
  metadataBase: new URL('https://votebuddy.cc'),
  other: {
    features: featuresData?.map(feature => feature.title)
  }
};
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body
          className={`antialiased font-poppins`}
            >
          {children}
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    gutter={8}
                />
            </body>
        </html>
    )
}
