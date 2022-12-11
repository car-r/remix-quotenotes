// import { Link } from "@remix-run/react";
import HeroSection from "~/components/LandingPage/HeroSection";
import NavBar from "~/components/LandingPage/NavBar";
// import LandingPageLayout from "~/components/Layouts/LandingPageLayout";

import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return (
    <div>
      <NavBar user={user}/>
      <HeroSection />

    </div>
  );
}
