import { Link } from "@remix-run/react";
import TopAddBtn from "./TopAddBtn";

export default function FirstBookBtn() {
    return (
        <Link to='/books/firstBook'>
            <TopAddBtn children={`Add Book`}/>
        </Link>
    )
}