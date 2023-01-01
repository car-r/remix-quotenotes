import moment from "moment";

export default function QuoteNoteDeleteCard({quoteNote}: any) {
    return (
        <div className="flex flex-col gap-1 bg-stone-800 p-4 rounded-lg max-w-2xl">
            <div className="flex flex-col py-3 border-b border-stone-700 w-full">
                <p className="text-sm font-semibold tracking-wider uppercase">Note ID</p>
                <p className="truncate ..."><span className="font-thin text-lg">{quoteNote.data.id}</span></p>
            </div>
            <div className="flex flex-col py-3 border-b border-stone-700 w-full last:border-0">
                <p className="text-sm font-semibold tracking-wider uppercase">Note created</p>
                <p><span className="font-thin text-lg">{moment(quoteNote.data.createdAt).format('MMM DD, YYYY')}</span></p>
            </div>
        </div>
    )
}