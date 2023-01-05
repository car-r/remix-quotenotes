import { Link } from "@remix-run/react";
import TopAddBtn from "./TopAddBtn";

export default function FirstQuoteBtn() {
    return (
        <Link to='/quotes/firstQuote'>
            <TopAddBtn children={`Add Book`}/>
        </Link>
    )
}