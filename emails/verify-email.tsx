import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html, Preview,
  Section,
  Tailwind,
  Text
} from "@react-email/components";
interface VerfiyEmailInfo {
  emailVerificationToken: string;
  otp?: string
}

const VerfiyEmailInfo = ({
  emailVerificationToken = "12345678",
  otp = "123456"
}: VerfiyEmailInfo) => {
    const verifyEmailUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${emailVerificationToken}`;

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
            <Preview>Verify Your Email</Preview>
            <Tailwind>
                <Body className="bg-white">
                    <Container>
                        <Section>
                            <Heading className="text-2xl text-center">Verify Your Email</Heading>
                            <Text>Hey there! </Text>
                            <Text>
                                To complete your registration and access your account, you must verify your email address with the code below.
                            </Text>
                            <Text className="text-xl text-gray-400 text-center">
                               Please click the link below to verify your email:  
                            </Text>
                            <Section className="text-center">
                              <Text className="text-5xl tracking-widest p-4 bg-secondary text-center">{otp}</Text>
                                <Button href={verifyEmailUrl} className="box-border w-full rounded-[8px] bg-primary px-[12px] py-[12px] text-center font-semibold text-primary-foreground" >
                                   Verify
                                </Button>
                            </Section>
                            <Hr />
                            <Section className="bg-gray-100 p-6 rounded">
                                <Text className="text-sm">
                                    <strong>Security Notice:</strong> If you didn&#39;t request this verify email, please ignore this email or contact support.
                                </Text>
                            </Section>
                        </Section>
                        <Text className="italic text-xs text-gray-400">
                            This message was sent by Electoral Voting System
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default VerfiyEmailInfo;

VerfiyEmailInfo.PreviewProps = {
     otp: "123456",
    emailVerificationToken: "12345678"
} as VerfiyEmailInfo;
