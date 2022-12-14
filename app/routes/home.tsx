import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import Footer from "~/components/Footer";
import Blog from "~/components/LandingPage/Blog";
import FeaturesSection from "~/components/LandingPage/FeaturesSection";
import HeroSection from "~/components/LandingPage/HeroSection";
import NavBar from "~/components/LandingPage/NavBar";
import Pricing from "~/components/LandingPage/Pricing";
import Reviews from "~/components/LandingPage/Reviews";
import { getUserById } from "~/models/user.server";
import { getUser, requireUserId,  } from "~/session.server";


export const meta: MetaFunction = () => ({
    charset: "utf-8",
    title: "QuoteNotes",
    viewport: "width=device-width,initial-scale=1",
});


  
export default function Home() {

    return (
        <>
            <div className="flex flex-col w-full mx-auto">
                <NavBar />
                <HeroSection />
                <FeaturesSection />
                <Pricing />
                <Reviews />
                <Blog />
                <Footer />
            </div>
        </>
    )
}