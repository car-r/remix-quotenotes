import { Form, NavLink, Outlet, useActionData, useCatch, useLoaderData, useParams, useTransition } from "@remix-run/react"
import { Link } from "@remix-run/react"
import { redirect } from "@remix-run/server-runtime"
import { Response } from "@remix-run/web-fetch"
import { useEffect, useRef, useState } from "react"
import BookErrorBackBtn from "~/components/Buttons/BookErrorBackBtn"
import PrimaryActionBtn from "~/components/Buttons/PrimaryActionBtn"

import PageTitle from "~/components/PageTitle"
import { prisma } from "~/db.server"
import { requireUserId } from "~/session.server";
import type { Tag } from "@prisma/client";
import ActionDataError from "~/components/Forms/ActionDataError"
import BookIdCard from "~/components/Books/BookIdCard"
import EditBookBtn from "~/components/Buttons/EditBookBtn"
import SectionTitle from "~/components/SectionTitle"
import QuoteNoteGrid from "~/components/Notes/QuoteNoteGrid"
import { QuoteNote } from "~/models/quote.server"


export const loader = async ({params, request}: any) => {
    const userId = await requireUserId(request);

    const data = await prisma.book.findUnique({
        where: { id: params.bookId },
        include: {
            author: true,
            tag: true,
            quote: {
                where: {userId: userId},
                orderBy: [
                    {
                        createdAt: 'desc'
                    }
                ]
            },
            quoteNote: {
                orderBy: [
                    {
                        createdAt: 'desc'
                    }
                ]
            }
        }
    })

    if (!data) {
        throw new Response("Can't find book.", {
            status: 404,
        })
    }

    const tags = await prisma.tag.groupBy({
        where: {bookId: params.bookId},
        by: ['body'],
        _count: true,
        orderBy: [{
            _count: {
                quoteId: 'desc'
            }
        }]
    })

    const user = await prisma.user.findUnique({
        where: {id: userId},
        include: {
            _count: {
                select: {
                    quotes: true
                }
            }
        }
    })

    return {data, tags, user}
}

export const action = async ({request}: any) => {
    const userId = await requireUserId(request);
    const form = await request.formData()
    const authorId = form.get('authorId')
    const quoteBody = form.get('body')
    const bookId = form.get('bookId')
    const pricingPlan = form.get('pricingPlan') as string
    const quoteCount = form.get('quoteCount')  || 0

    console.log(Object.fromEntries(form))


    // Action to create Quote
    if(form.get('_method') === 'create') {
        const body = quoteBody.trim()
        const errors = {
            body: '',
            pricingPlan: ''
        }

        function validatePricingPlan() {
            if (pricingPlan === 'free' && quoteCount > 24) {
                return errors.pricingPlan = `Upgrade your Pricing Plan`
            } else if (pricingPlan === 'pro' && quoteCount > 199) {
                return errors.pricingPlan = `Upgrade your Pricing Plan`
            }
        }
        validatePricingPlan()

        function checkBody(body: any) {
            if(!body || body.length < 4) {
                return errors.body = `Quote too short`
            }
        }
    
        checkBody(body)

        if (errors.body || errors.pricingPlan) {
            const values = Object.fromEntries(form)
            return { errors, values }
        }

        const fields = { authorId, body, userId, bookId }
        await prisma.quote.create({ data: fields})
        return redirect(`/books/${bookId}`)
    }

}


export default function BookIdRoute() {
    const params = useParams()
    
    const data = useLoaderData()
    let transition = useTransition()
    let isAdding = 
        transition.state === "submitting" &&
        transition.submission.formData.get("_method") === "create"

    const formRef = useRef<HTMLFormElement>(null)
    const book = data.data

    const actionData = useActionData()

    useEffect(() => {
        if (!isAdding) {
            formRef.current?.reset();
        }
    },[isAdding])

    const [search, setSearch] = useState('')

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        setSearch(e.currentTarget.value)
    }
    console.log(data)

    return (
        <div className="flex flex-col pt-6 md:pt-10 max-w-6xl">
            <PageTitle children={book.title} btn={<EditBookBtn  data={data} />}/>
            <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex gap-2 h-8">
                    <label htmlFor="search" className="flex bg-stone-700 rounded-xl pl-2 w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mt-1 ">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input 
                            type="text" 
                            onChange={(e) => handleChange(e)}
                            placeholder="search quotes"
                            className="px-2 py-1 ml-1 md:w-52  border border-stone-700 bg-stone-700 rounded-xl "
                            
                        />
                    </label>
                </div>
                <div className="flex gap-4 pb-6 mb-6 overflow-auto scrollbar-thin scrollbar-track-stone-800 scrollbar-thumb-stone-700">
                    <Link to={`/books/${data.data.id}`} className={`items-center flex text-xs font-semibold px-4 py-2 rounded-xl  whitespace-nowrap cursor-pointer  ${params.tagId ? 'bg-stone-800 text-stone-400' : 'bg-stone-300 text-stone-800'}`}>
                        <p  className="">
                            all
                        </p>
                    </Link>
                    {data.tags?.map((tag: Tag) => (
                        <NavLink to={`/books/${data.data.id}/tags/${tag.body}`} key={tag.body} className={({ isActive }) =>
                        ` items-center flex text-xs font-semibold px-4 py-2 rounded-xl  whitespace-nowrap cursor-pointer hover:bg-stone-700 ${isActive ? "bg-stone-300 text-stone-800 hover:bg-stone-300 " : "bg-stone-800"}`
                        }>
                            <div >
                                <p  className="">{tag.body}</p>
                            </div>
                        </NavLink>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:flex gap-6 ">
                <div>
                    <Outlet context={[search]}/>
                </div>
                <div className="flex flex-col gap-6  md:order-last md:ml-auto">
                    <Form method="post" ref={formRef}
                        className="flex flex-col gap-4 border border-stone-800 bg-stone-800 p-4 rounded-md text-stone-300/60 font-light"
                    >
                        <div className="flex flex-col">
                            <label></label>
                            <textarea
                            name="body"
                            rows={3}
                            className="min-w-xl mb-1 text-stone-800 rounded-md border-2 border-stone-800 py-2 px-3 text-base"
                            />
                            {actionData?.errors.body && (
                                <p className="text-red-400 text-sm">{actionData.errors.body}</p>
                            )}
                            {actionData?.errors.pricingPlan && (
                                <ActionDataError children={actionData.errors.pricingPlan}/>
                            )}
                        </div>
                        <div className="hidden">
                            <input type="hidden" name="authorId" value={book.authorId}/>
                        </div>
                        <div className="hidden">
                            <input type="hidden" name="bookId" value={book.id}/>
                        </div>
                        <input hidden type="text" name="pricingPlan" defaultValue={data.user.pricingPlan}/>
                        <input hidden type="number" name="quoteCount" defaultValue={data.user._count.quotes}/>
                        <div className="flex flex-col">
                            <button type="submit" name="_method" value="create" disabled={isAdding}>
                                <PrimaryActionBtn children={isAdding ? "Adding..." : "Add Quote"}/>
                            </button>             
                        </div>
                    </Form>
                    <div>
                        <BookIdCard data={data}/>
                    </div>
                </div>
            </div>
            <div className="mt-6 mb-28">
                <SectionTitle children={"Notes"}/>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.data.quoteNote.map((note: any) => (
                        <Link to={`/notes/${note.id}`} key={note.id} className="flex" >
                            <div className='flex flex-col justify-center p-4 border border-stone-600 text-stone-300 rounded-sm hover:bg-stone-600 text-center w-full'>
                                <p className="line-clamp-3 text-sm">{note.body}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);
  
    return (
        <div className="flex flex-col pt-6 md:pt-10 md:max-w-5xl pb-6">
            <PageTitle children={`Book`} btn={<BookErrorBackBtn />}/>
            <div className="flex flex-col w-full md:grid md:grid-cols-3">
                <div className="flex flex-col col-span-2 ">
                    <div className='flex flex-col justify-center py-10 border border-red-500 text-red-500 rounded-lg text-center w-full'>
                        <p className="text-sm font-semibold tracking-wide">{`Looks like an error: ${error}`}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CatchBoundary() {
    const caught = useCatch();
    const params = useParams();
    if (caught.status === 404) {
      return (
        <div className="flex flex-col pt-6 md:pt-10 md:max-w-5xl pb-6">
            <PageTitle children={`Book`} btn={<BookErrorBackBtn />}/>
            <div className="flex flex-col w-full md:grid md:grid-cols-3">
                <div className="flex flex-col col-span-2 ">
                    <div className='flex flex-col justify-center py-10 border border-red-500 text-red-500 rounded-lg text-center w-full'>
                        <p className="text-sm font-semibold tracking-wide">{`Can't find book ${params.bookId}`}</p>
                    </div>
                </div>
            </div>
        </div>
      );
    }
    throw new Error(`Unhandled error: ${caught.status}`);
}