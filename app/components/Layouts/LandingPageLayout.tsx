import NavBar from "../LandingPage/NavBar";

export default function LandingPageLayout({children}: any) {
    return (
        <div>
            <NavBar />
            <div>
                {children}
            </div>
        </div>
    )
}