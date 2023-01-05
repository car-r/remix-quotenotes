import { Link } from "@remix-run/react";
import QuoteNote from "./QuoteNote";

export default function QuoteNoteGrid({quote}: any) {

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quote.quote.note.map((note: any) => (
                <Link to={`/notes/${note.id}`} key={note.id} className="flex" >
                    <QuoteNote note={note}/>
                </Link>
            ))}
        </div>
    )
}