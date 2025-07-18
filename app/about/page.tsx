

import AboutSectionOne from "@/components/sections/about/about-section-1";
import AboutSectionTwo from "@/components/sections/about/about-section-2";
import Breadcrumb from "@/components/sections/common/bread-crumbs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About VoteBuddy | Electoral Voting System",
  description: "A modern voting platform designed to bring transparency, security, and ease to elections—whether for schools, organizations, or student councils. We believe every vote should be simple to cast, impossible to tamper with, and effortless to manage.",
  // other metadata
};

const AboutPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="About"
        description="A modern voting platform designed to bring transparency, security, and ease to elections—whether for schools, organizations, or student councils. We believe every vote should be simple to cast, impossible to tamper with, and effortless to manage."
      />
      <AboutSectionOne />
      <AboutSectionTwo />
    </>
  );
};

export default AboutPage;
