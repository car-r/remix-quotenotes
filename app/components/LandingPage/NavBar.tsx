
import { Link, NavLink, useLoaderData, useOutletContext } from "@remix-run/react";





export default function NavBar() {
    const user: any = useOutletContext()
    console.log('landingNav ->', user)
    return (
        <>
            <nav className="flex items-center text-stone-200 py-6 justify-between w-full px-2 sm:px-4 mx-auto max-w-5xl">
                <Link to={'/'}>
                    <p className="text-lg sm:text-xl md:text-2xl font-extrabold hover:text-stone-100">QuoteNotes</p>
                </Link>
                <ul className="flex gap-3 md:gap-10 items-center text-sm md:text-base">
                    <NavLink to="/blog"
                        className={({ isActive }) =>
                        `text-xs xs:text-base hover:text-blue-400 ${isActive ? "text-blue-400" : ""}`
                        }
                    >
                        Blog
                    </NavLink>
                    <NavLink to="/login"
                        className={({ isActive }) =>
                        `text-xs xs:text-base hover:text-blue-400 ${isActive ? "text-blue-400" : ""}`
                        }
                    >
                        Log In
                    </NavLink>
                    <Link to="/join" className="">
                        <button className="px-1 py-1 sm:px-3 sm:py-1 md:px-5 md:py-2 font-bold text-xs xs:text-base text-stone-900 rounded-sm border border-blue-400 bg-blue-400 transition-all ease-in-out hover:bg-blue-600 hover:border-blue-600 hover:text-white">
                            Sign Up
                        </button>
                    </Link>
                    
                </ul>
            </nav>
        </>
    )
}