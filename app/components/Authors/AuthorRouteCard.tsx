

// const imageOnErrorHandler = (
//     event: React.SyntheticEvent<HTMLImageElement, Event>
//   ) => {
//     event.currentTarget.src = 'https://icon-library.com/images/default-user-icon/default-user-icon-8.jpg';
//     event.currentTarget.className = "error";
// };

export type Author = {
    author: {
        author: {
            id: string
            name: string
            imgUrl: string
            userId: string
        }
    }
}

export default function AuthorRouteCard({author}: Author) {
    // const [edit, setEdit] = useState(false)

    return (
        <div className="flex flex-col rounded-lg w-full items-center border-2 border-stone-800 h-72">
            <div className="bg-stone-800 h-28 w-full p-4 rounded-t-md">
                <div className="flex text-xs justify-end ">
                </div>
            </div>
            <img 
                src={author.author.imgUrl} 
                className="w-32 h-32 xs:w-40 xs:h-40 object-cover max-w-72 rounded-full absolute mt-12 xs:mt-8 " 
                alt={author.author.name}
                onError={(e: any) => e.target.src = 'https://icon-library.com/images/default-user-icon/default-user-icon-8.jpg'}
            />
            <p className="mt-auto text-base pb-6">{author.author.name}</p>
        </div>
    )
}