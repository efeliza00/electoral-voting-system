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
	bannerImage: string
    electionName: string
    startDate: Date
    endDate: Date
	voterInfo: Omit<
		Voter,
		"_id" | "isVoted" | "isNotified" | "email" | "votedFor"
	>
}

export default function VoterAuthorizationInfo({
	bannerImage = "https://cdn.pixabay.com/photo/2016/08/05/09/31/banner-1571858_1280.jpg",
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
			<Head>
				<Font
					fontFamily="Poppins"
					fallbackFontFamily="sans-serif"
					webFont={{
						url: "https://fonts.googleapis.com/css2?family=Poppins:wght@100",
						format: "woff2",
					}}
					fontWeight={200}
				/>
			</Head>

            <Tailwind>
				<Body>
                    <Preview>Voter Authorization Information</Preview>
					<Container>
                        <Section>
							<Section>
								{bannerImage ? (
									<Img
										src={`${bannerImage}`}
										alt="electoral-voting-system-logo"
										className="object-cover h-full max-h-[600px] max-w-[800px] w-full"
									/>
								) : (
									<div className="object-cover h-full max-h-[600px] max-w-[800px] w-full bg-primary" />
								)}
                            </Section>
							<Section>
                                <Heading className="text-2xl">
                                    Check Voter Information
                                </Heading>
                                <Text>Hi {name}!</Text>
                                <Text>
                                    You have been registered as a voter on this
                                    upcoming election{" "}
									<span className="font-semibold">
                                        {electionName}
                                    </span>{" "}
                                    that starts on{" "}
									<span className="font-semibold">
                                        {format(startDate, "LLL dd, y")}
                                    </span>{" "}
                                    <span className="font-semibold">
                                        {format(startDate, "hh:mm a")}
                                    </span>{" "}
                                    and ends on{" "}
									<span className="font-semibold">
                                        {format(endDate, "LLL dd, y")}
                                    </span>{" "}
                                    <span className="font-semibold">
                                        {format(endDate, "hh:mm a")}
                                    </span>
                                </Text>
								<Section className="text-center">
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
							<Section className="flex items-center justify-center bg-gray-300/20 p-20">
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
	bannerImage:
		"https://cdn.pixabay.com/photo/2016/08/05/09/31/banner-1571858_1280.jpg",
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
