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

interface ResetPasswordInfo {
  email: string;
  resetPasswordToken: string;
}

const ResetPasswordInfo = ({
  email = "0qYB4@example.com",
  resetPasswordToken = "12345678",
}: ResetPasswordInfo) => {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetPasswordToken}`;

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
            <Preview>Reset Your Password</Preview>
            <Tailwind>
                <Body className="bg-white">
                    <Container>
                        <Section>
                            <Heading className="text-2xl text-center">Reset Your Password</Heading>
                            <Text>Hey there! </Text>
                            <Text>
                                We received a request to reset the password for your VoteBuddy account 
                                associated with <strong>{email}</strong>.
                            </Text>
                            <Text className="text-xl text-gray-400 text-center">
                                To reset your password, click the link below:
                            </Text>
                            <Section className="text-center">
                                <Button href={resetUrl} className="box-border w-full rounded-[8px] bg-primary px-[12px] py-[12px] text-center font-semibold text-primary-foreground" >
                                   Reset Password
                                </Button>
                            </Section>
                            <Hr />
                            <Section className="bg-gray-100 p-6 rounded">
                                <Text className="text-sm">
                                    <strong>Security Notice:</strong> If you didn&#39;t request this password 
                                    reset, please ignore this email or contact support.
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

export default ResetPasswordInfo;

// For preview purposes
ResetPasswordInfo.PreviewProps = {
    email: "0qYB4@example.com",
    resetPasswordToken: "12345678"
} as ResetPasswordInfo;
