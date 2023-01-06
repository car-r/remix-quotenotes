export default function QuoteNote({note}: any) {
    return (
        <div className='flex flex-col justify-center p-4 border border-stone-600 text-stone-300 rounded-sm hover:bg-stone-600 text-center w-full'>
            <p className="line-clamp-3 text-sm">{note.body}</p>
        </div>
    )
}