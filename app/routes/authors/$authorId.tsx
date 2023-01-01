import { useLoaderData, Link, Outlet, useCatch, useParams } from "@remix-run/react"
import PageTitle from "~/components/PageTitle"
import SectionTitle from "~/components/SectionTitle"
import { prisma } from "~/db.server"
import { requireUserId } from "~/session.server";
import AuthorErrorBackBtn from "~/components/Buttons/AuthorErrorBackBtn"
import AddBookBtn from "~/components/Buttons/AddBookBtn"
import type { LoaderFunction } from "@remix-run/node";
import EditAuthorBtn from "~/components/Buttons/EditAuthorBtn";
import AuthorRouteCard from "~/components/Authors/AuthorRouteCard";
import BookHomeCard from "~/components/Books/BookHomeCard";
import QuoteSmallCard from "~/components/Quotes/QuoteSmallCard";

export type Book = {
    id: string
    title: string
    imgUrl: string
    author: {
        name: string
    }
}

export const loader: LoaderFunction = async ({params, request}) => {
    const userId = await requireUserId(request);

    const author = await prisma.author.findUnique({
        where: { id: params.authorId },
        include: {
            _count: {
              select: {
                quote: true,
                book: true,
                quoteNote: true
              }
            },
            book: {
                where: {userId: userId},
                include: {
                    author: true,
                }
            },
            quote: {
                take: 10,
                orderBy: {
                    note: {
                        '_count': 'desc'
                    }
                }
            }
          }
    })

    if (!author) {
        throw new Response("Can't find author.", {
            status: 404,
        })
    }
    
    return {author}
}


export default function AuthorDetail() {
    const data = useLoaderData()
    console.log('author detail route',data)

    return (
        <div className="flex flex-col pt-6 md:pt-10 max-w-5xl">
            <PageTitle children={data.author.name} btn={<EditAuthorBtn  data={data} />}/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl py-2 mb-20">
                <AuthorRouteCard author={data}/>
                <Outlet context={data}/>
            </div>
            <div className="mb-28">
                <SectionTitle children={'Books'} btn={<AddBookBtn />}/>
                {data.author._count.book < 1 ?
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-28">
                    </div>
                    :
                    <div className="flex overflow-auto pb-6 snap-x scrollbar-thin scrollbar-track-stone-800 scrollbar-thumb-stone-700 p-1 gap-4">
                        {data.author.book.map((book: Book) => (
                            <Link to={`/books/${book.id}`} key={book.id}>
                                <BookHomeCard book={book}/>
                            </Link>
                        ))}
                    </div>
                }
            </div>
            <div className="pb-28 flex flex-col">
                <div>
                    {data.author._count.quotes < 1 ? 
                        <SectionTitle children={'Quotes'} />
                        :
                        <SectionTitle children={'Top Quotes'} />
                    }
                    <div className="flex overflow-auto pb-4 snap-x scrollbar-thin scrollbar-track-stone-800 scrollbar-thumb-stone-700">
                        <div className="flex md:flex md:flex-row gap-4 mx-1">
                            {data.author.quote.map((quote: any) => (
                                <Link to={`/quotes/${quote.id}`} key={quote.id} className="snap-start px-1">
                                    <QuoteSmallCard quote={quote}/>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);
    const quotes = {title: 'Quotes', count: '0'}
    const books = {title: 'Books', count: '0'}
    const notes = {title: 'Notes', count: '0'}
    const detailArray = [books, quotes, notes]
  
    return (
        <div className="flex flex-col pt-6 md:pt-10 max-w-5xl">
            <PageTitle children={`Author`} btn={<AuthorErrorBackBtn />}/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl py-2 mb-20">
                <div className="flex flex-col justify-center p-4 border border-red-500 text-red-500 bg-stone-800 rounded-md ">
                    <p className="text-xs sm:text-sm md:text-base text-center italic font-semibold py-6">
                        {`Looks like an error ${error}`}
                    </p>
                </div>
                <div className="flex flex-col sm:h-full sm:justify-center border-2 border-stone-800 p-4 rounded-lg">
                    <div className="mb-3">
                        {detailArray.map((detail) => (
                            <div key={detail.title} className="flex flex-col py-3 border-b border-stone-700 w-full last:border-0 ">
                                <p className="text-sm font-semibold tracking-wider uppercase">{detail.title}</p>
                                <p><span className="font-thin text-2xl">{detail.count}</span></p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mb-28">
                <SectionTitle children={'Books'}/>
            </div>
            <div className="mb-28">
                <SectionTitle children={'Quotes'}/>
            </div>
        </div>
    );
}

export function CatchBoundary() {
    const caught = useCatch();
    const params = useParams();
    const quotes = {title: 'Quotes', count: '0'}
    const books = {title: 'Books', count: '0'}
    const notes = {title: 'Notes', count: '0'}
    const detailArray = [books, quotes, notes]
    if (caught.status === 404) {
      return (
        <div className="flex flex-col pt-6 md:pt-10 max-w-5xl">
            <PageTitle children={`Author`} btn={<AuthorErrorBackBtn />}/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl py-2 mb-20">
                <div className="flex flex-col justify-center p-4 border border-red-500 text-red-500 bg-stone-800 rounded-md ">
                    <p className="text-xs sm:text-sm md:text-base text-center italic font-semibold py-6">
                        {`Can't find author ${params.authorId}`}
                    </p>
                </div>
                <div className="flex flex-col sm:h-full sm:justify-center border-2 border-stone-800 p-4 rounded-lg">
                    <div className="mb-3">
                        {detailArray.map((detail) => (
                            <div key={detail.title} className="flex flex-col py-3 border-b border-stone-700 w-full last:border-0 ">
                                <p className="text-sm font-semibold tracking-wider uppercase">{detail.title}</p>
                                <p><span className="font-thin text-2xl">{detail.count}</span></p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mb-28">
                <SectionTitle children={'Books'}/>
            </div>
            <div className="mb-28">
                <SectionTitle children={'Quotes'}/>
            </div>
        </div>
      );
    }
    throw new Error(`Unhandled error: ${caught.status}`);
}