import { Voter } from "@/app/models/Election"
import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"
import { format } from "date-fns"

interface VoterAuthorizationInfoProps {
    electionName: string
    startDate: Date
    endDate: Date
    voterInfo: Omit<Voter, "_id" | "isVoted" | "isNotified" | "email" | "votedFor">
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
    : ""

export default function VoterAuthorizationInfo({
    electionName = "Election Sample 2025",
    startDate = new Date(),
    endDate = new Date(),
    voterInfo = {
        name: "",
        cluster: "",
        voterId: "",
        accessCode: "",
    },
}: VoterAuthorizationInfoProps) {
    const { name, voterId: id, cluster, accessCode } = voterInfo

    return (
        <Html>
            <Head />
            <Font
                fontFamily="Roboto"
                fallbackFontFamily="Verdana"
                webFont={{
                    url: "https://fonts.googleapis.com/css2?family=Poppins",
                    format: "woff2",
                }}
                fontWeight={100}
            />
            <Tailwind>
                <Body className="bg-white">
                    <Preview>Voter Authorization Information</Preview>
                    <Container className="m-4">
                        <Section>
                            <Section className="bg-gray-400">
                                <Img
                                    src={`${baseUrl}/images/logo.png`}
                                    width="75"
                                    height="45"
                                    alt="electoral-voting-system-logo"
                                />
                            </Section>
                            <Section className="p-20">
                                <Heading className="text-2xl">
                                    Check Voter Information
                                </Heading>
                                <Text>Hi {name}!</Text>
                                <Text>
                                    You have been registered as a voter on this
                                    upcoming election{" "}
                                    <span className="font-medium">
                                        {electionName}
                                    </span>{" "}
                                    that starts on{" "}
                                    <span className="font-medium">
                                        {format(startDate, "LLL dd, y")}
                                    </span>{" "}
                                    <span className="font-semibold">
                                        {format(startDate, "hh:mm a")}
                                    </span>{" "}
                                    and ends on{" "}
                                    <span className="font-medium">
                                        {format(endDate, "LLL dd, y")}
                                    </span>{" "}
                                    <span className="font-semibold">
                                        {format(endDate, "hh:mm a")}
                                    </span>
                                </Text>
                                <Section className="flex flex-col items-center justify-center">
                                    <Text className=" text-xl text-gray-400 text-center">
                                        Cluster
                                    </Text>
                                    <Text className="uppercase text-center font-extrabold text-2xl">
                                        {cluster}
                                    </Text>
                                    <Text className=" text-xl text-gray-400 text-center">
                                        Voter ID
                                    </Text>
                                    <Text className="uppercase text-center font-extrabold text-2xl">
                                        {id}
                                    </Text>

                                    <Text className=" text-xl text-gray-400 text-center">
                                        Authorization Code
                                    </Text>
                                    <Text className="uppercase text-center font-extrabold text-6xl">
                                        {accessCode}
                                    </Text>
                                </Section>
                            </Section>
                            <Hr />
                            <Section className="flex items-center justify-center bg-gray-400/20 p-20">
                                <Text className="text-md">
                                    <strong>Important Notice:</strong> Do not
                                    share voter information with others.
                                    Unauthorized use of this data may compromise
                                    election integrity and result in removal of
                                    voting privileges.
                                </Text>
                            </Section>
                        </Section>
                        <Text className="italic text-xs">
                            This message was produced and distributed by
                            Electoral Voting System.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}

VoterAuthorizationInfo.PreviewProps = {
    electionName: "Annual Community Election 2025",
    startDate: new Date("2025-01-15"),
    endDate: new Date("2025-01-20"),
    voterInfo: {
        name: "John Doe",
        cluster: "C1",
        voterId: "V12345678",
        accessCode: "336SD",
    },
} satisfies VoterAuthorizationInfoProps
