// import { Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import HeroSection from "~/components/LandingPage/HeroSection";
import NavBar from "~/components/LandingPage/NavBar";
import { requireUserId } from "~/session.server";
// import LandingPageLayout from "~/components/Layouts/LandingPageLayout";

import { useOptionalUser } from "~/utils";

export const loader: LoaderFunction = async ({request}) => {
  const userId = await requireUserId(request);
  return {userId}
}

export default function Index() {
  const user = useOptionalUser();
  return (
    <div>
      index

    </div>
  );
}
