import { Link, useLoaderData } from "@remix-run/react"
import PageTitle from "~/components/PageTitle"
import { prisma } from "~/db.server"
import { requireUserId } from "~/session.server";
import AddBookBtn from "~/components/Buttons/AddBookBtn";
import BookCard from "~/components/Books/BookCard";

export const loader = async ({request}: any) => {
    const userId = await requireUserId(request);
    const data = await prisma.book.findMany(
        {where: {userId: userId},
        include: {
            author: true,
            quote: true
        }
        }
    )

    return {data}
}

export default function BookIndex() {
    const data = useLoaderData()
    const bookCount = data.data.length

    return (
        <div className="flex flex-col pt-6 md:pt-10 max-w-5xl">
            {bookCount > 0 ?
                <PageTitle children={`${bookCount} Books`} btn={<AddBookBtn />}/>
                :
                <PageTitle children={`Books`} btn={<AddBookBtn />}/>
            }
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 pb-1">
                {data.data.map((book: any) => (
                    <Link to={`/books/${book.id}`} key={book.id} className="flex">
                        <BookCard book={book}/>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);
  
    return (
        <div className="flex flex-col pt-6 md:pt-10 max-w-5xl">
            <PageTitle children={`Books`}/>
            <div className='flex flex-col max-w-xl justify-center py-10 px-6  border border-red-500 text-red-500 rounded-lg text-center'>
                <p className="text-sm font-semibold tracking-wide">{`Looks like an error: ${error}`}</p>
            </div>
        </div>
    );
}