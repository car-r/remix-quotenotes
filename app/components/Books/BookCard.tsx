
export type Book = {
    book: {
        title: string
        imgUrl: string
        author: {
            name: string
        }
    }
}

export default function BookCard({book}: Book) {

    return (
        <div className="p-4 border border-stone-800 bg-stone-800 rounded-md hover:ring-2 hover:ring-blue-400 hover:text-stone-100">
            <div className="pb-2">
                <img src={book.imgUrl} alt={book.title}
                    onError={(e: any) => e.target.src = 'https://neelkanthpublishers.com/assets/bookcover_thumb.png'} 
                    className="object-fit max-w-96"
                />
            </div>
            <div>
                <p className="font-bold">
                    {book.title}
                </p>     
                <p className="text-sm font-thin tracking-wider">
                    {book.author.name}
                </p>               
            </div>
        </div>
    )
}