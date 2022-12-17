import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Quote, Tag } from "@prisma/client";
import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import AddQuoteBtn from "~/components/Buttons/AddQuoteBtn";
import FirstQuoteBtn from "~/components/Buttons/FirstQuoteBtn";
import PageTitle from "~/components/PageTitle";
import QuoteIndexCard from "~/components/Quotes/QuoteIndexCard";
import { getSortedQuotes, updateQuoteFavorite } from "~/models/quote.server";
import { getTagsByGroup, getTagsWithQuotes } from "~/models/tag.server";
import { requireUserId } from "~/session.server"


export const loader: LoaderFunction = async ({request}) => {
    const userId = await requireUserId(request)

    const quotes = await getSortedQuotes({userId})
    const tags = await getTagsByGroup({userId})
    const tagsWithQuotes = await getTagsWithQuotes({ userId })


    return {quotes, tags, tagsWithQuotes, }
}

export const action: ActionFunction = async ({request}) => {
    const userId = await requireUserId(request);
    const form = await request.formData()
    const id = form.get('id') as string
    const isFavorited = form.get('isFavorited') as string

    await updateQuoteFavorite({ userId, id, isFavorited})
    return redirect('/quotes')
}

export type QuoteType = {
    id: string
    isFavorited: string
    body: string
    author: {
        name: string
        id: string
    }
    book: {
        id: string
        title: string
    }
}

export default function QuotesIndex() {
    const data = useLoaderData()
    const qouteCount = data.quotes.length

    const [search, setSearch] = useState('')

    const filteredSearch = data.quotes.filter((quote: Quote) =>
        quote.body.toLowerCase().includes(search.toLowerCase())
    )

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        setSearch(e.currentTarget.value)
    }
    console.log('search state 2->', search)

    console.log('Quote Index data ->', data)
    return (
        <>
            <div className="flex flex-col pt-6 md:pt-10 max-w-5xl">
                {qouteCount > 0 ?
                    <PageTitle children={`${qouteCount} Quotes`} btn={<AddQuoteBtn />}/>
                    :
                    <PageTitle children={`Quotes`} btn={<FirstQuoteBtn />}/>
                }
                <div className="flex flex-col gap-6  md:flex-row">
                    <div className="flex gap-2 h-8 ">
                        <label htmlFor="search" className="flex bg-stone-700 rounded-xl pl-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mt-1 ">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input 
                                type="text" 
                                onChange={(e) => handleChange(e)}
                                placeholder="search quotes"
                                className="px-2 py-1 ml-1 w-full md:w-52  border border-stone-700 bg-stone-700 rounded-xl "
                                
                            />
                        </label>
                    </div>
                    <div className="flex gap-4 pb-6 mb-6 overflow-auto scrollbar-thin scrollbar-track-stone-800 scrollbar-thumb-stone-700">
                        <div className="items-center flex text-xs font-semibold px-4 py-2 rounded-xl  whitespace-nowrap cursor-pointer bg-stone-300 text-stone-800">
                            <p  className="">
                                all
                            </p>
                        </div>
                        {data.tags.map((tag: Tag) => (
                            <Link to={`/quotes/tags/${tag.body}`} key={tag.body}>
                                <div className="items-center flex text-xs font-semibold px-4 py-2 rounded-xl  whitespace-nowrap cursor-pointer bg-stone-800 hover:bg-stone-700">
                                    <p  className="">{tag.body}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-1">
                    {filteredSearch.map((quote: QuoteType) => (
                        <QuoteIndexCard quote={quote} key={quote.id}/>
                    ))}
                </div>
            </div>
        </>
    )
}