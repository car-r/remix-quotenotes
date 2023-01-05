import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { Form, Link, useLoaderData, useOutletContext } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { updateQuoteFavorite } from "~/models/quote.server";
import type { Quote } from "@prisma/client";
import { getBook } from "~/models/book.server";


export const loader: LoaderFunction = async ({params, request}) => {
    const userId = await requireUserId(request);
    invariant(params.bookId, "bookId not found");

    const data = await getBook({ userId, id: params.bookId })

    if (!data) {
        throw new Response("Can't find book.", {
            status: 404,
        })
    }

    return {data}
}

export const action: ActionFunction = async ({request, params}) => {
    const userId = await requireUserId(request);
    // invariant(params.bookId, "bookId not found");
    const form = await request.formData()
    const bookId = params.bookId as string
    const id = form.get('id') as string
    const isFavorited = form.get('isFavorited') as string

    console.log(Object.fromEntries(form))

    // Action to update if Quote is favorited
    if (form.get('_method') !== 'create') {

        await updateQuoteFavorite({ userId, id, isFavorited})
        return redirect(`/books/${bookId}`)
    }
}

export default function BookIdHome() {
    const data = useLoaderData()
    const book = data.data

    const [search]: string = useOutletContext()
    const filteredSearch = book.quote.filter((quote: Quote) =>
        quote.body.toLowerCase().includes(search.toLowerCase())
    )
    return (
        <div>
            <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-1 md:grid-flow-row md:auto-rows-max lg:grid-cols-2 pb-1">
                {filteredSearch.map((quote: Quote) => (
                    <div key={quote.id} className="flex flex-col p-4 border border-stone-800 bg-stone-800 rounded-md text-stone-300/60 hover:ring-2 hover:ring-blue-400 hover:text-stone-100 min-w-[165px]">
                        <div className="flex flex-col min-h-full">
                            <Form method="post">
                                <div onClick={() => console.log('clicked')} className="flex justify-end ">   
                                    <div className="flex flex-col">
                                    <input type="hidden" name="id" value={quote.id}/>
                                    <input type="hidden" name="bookId" value={quote.bookId}/>
                                    {quote.isFavorited === "isFavorited" ? <input type="hidden" name="isFavorited" value="notFavorited"/> : <input type="hidden" name="isFavorited" value="isFavorited"/>}
                                        <button type="submit">
                                            {quote.isFavorited === "isFavorited" ? 
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                </svg>
                                                :
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-right" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            }
                                        </button>
                                    </div>
                                </div>
                            </Form>
                            <Link to={`/quotes/${quote.id}`} className="flex flex-col flex-1 justify-center py-4 px-5">
                                <div className=" ">
                                    <p className="text-base text-center italic font-semibold">"{quote.body}"</p>
                                </div>
                            </Link>
                        </div>
                    </div> 
                ))}
            </div>  
        </div>
    )
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);
  
    return (
        <div className="flex flex-col pt-6 md:pt-10 max-w-5xl">
            <div className='flex flex-col max-w-xl justify-center py-10 px-6  border border-red-500 text-red-500 rounded-lg text-center'>
                <p className="text-sm font-semibold tracking-wide">{`Looks like an error: ${error}`}</p>
            </div>
        </div>
    );
}