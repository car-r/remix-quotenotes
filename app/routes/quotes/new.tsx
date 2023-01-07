import { redirect } from "@remix-run/node"
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import type { Author, Book } from "@prisma/client";
import { Form, useActionData, useLoaderData, useTransition } from "@remix-run/react"
// import { prisma } from "~/db.server"
import { useEffect, useRef, useState } from "react"
import { requireUserId } from "~/session.server";
import PageTitle from "~/components/PageTitle";
import PrimaryActionBtn from "~/components/Buttons/PrimaryActionBtn";
import { createQuote } from "~/models/quote.server";
import { getUserWithBookAndAuthor } from "~/models/user.server";
import ActionDataError from "~/components/Forms/ActionDataError";
import BackBtn from "~/components/Buttons/BackBtn";

export const action: ActionFunction = async ({request}) => {
    const form = await request.formData()
    const userId = await requireUserId(request);
    const authorId = form.get('authorId') as string
    const quoteBody = form.get('body') as string
    const bookId = form.get('bookId') as string
    const pricingPlan = form.get('pricingPlan') as string
    const quoteCount = form.get('quoteCount')  || 0
    // const authorName = form.get('authorName') as string
    console.log(Object.fromEntries(form))

    // const fields = { authorId, body, userId, bookId, authorName }
    // const fields = { authorId, body, userId, bookId }

    let body = quoteBody.trim()
    const isWrappedInQuotes = new RegExp('/^"(.*)"$/')

    const validateisWrappedInQuotes = (value: string) => {
        if (!isWrappedInQuotes.test(value)) {
            return body = body.slice(1, -1 )
        }
    }

    validateisWrappedInQuotes(body)

    const errors = {
        body: '',
        bookId: '',
        pricingPlan: ''
    }

    function validatePricingPlan() {
        if (pricingPlan === 'free' && quoteCount > 49) {
            return errors.pricingPlan = `Please upgrade your Pricing Plan`
        } else if (pricingPlan === 'pro' && quoteCount > 199) {
            return errors.pricingPlan = `Please upgrade your Pricing Plan`
        }
    }

    validatePricingPlan()

    function checkBody(body: string) {
        if(!body || body.length < 4) {
            return errors.body = `Quote too short`
        }
    }

    checkBody(body)

    function checkBookId(bookId: string) {
        if(bookId === 'nobook') {
            return errors.bookId = `Please create book first`
        }
    }

    checkBookId(bookId)

    if (errors.body || errors.bookId || errors.pricingPlan) {
        const values = Object.fromEntries(form)
        return { errors, values }
    }

    // const quote = await prisma.quote.create({ data: fields})

    const quote = await createQuote({ userId, body, authorId, bookId })
    return redirect(`/quotes/${quote.id}`)
}

export const loader: LoaderFunction = async ({request}) => {
    const userId = await requireUserId(request);
    // const data = await prisma.user.findUnique({
    //     where: { id: userId},
    //     include: {
    //         authors: true, // Return all fields
    //         book: true,
    //     }
    // })

    const data = await getUserWithBookAndAuthor( userId )
    // const authors = await prisma.author.findMany({where: {userId: userId}})
    // const users = await prisma.user.findMany()
    // const book = await prisma.book.findMany({where: {userId: userId}})
    // return {authors, users, book, data}
    return {data}
}

export default function NewQuote() {
    const actionData = useActionData()
    const data = useLoaderData()
    // const [authorName, setAuthorName] = useState(data.authors[0].name)
    const [authorId, setAuthorId] = useState(data.data.authors[0].id)
    // const [authorId, setAuthorId] = useState('')
    let transition = useTransition()
    let isAdding = 
        transition.state === "submitting" &&
        transition.submission.formData.get("_method") === "create"

    // let formRef = useRef()
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (!isAdding) {
            formRef.current?.reset();
        } 
    },[isAdding])


    function onAuthorChange(e: React.FormEvent<HTMLInputElement>) {
        console.log(e.currentTarget.value)
        console.log(data.data.authors.length)
        for (const author of data.data.authors) {
            if (author.id === e.currentTarget.value) {
                console.log('its a match on ' + author.name)
                // setAuthorName(author.name)
                setAuthorId(author.id)
            }
            else {
                console.log('no match')
            }
        }
    }
    
    return (
        <div className="flex flex-col pt-6 md:pt-10 md:max-w-5xl pb-6">
            <PageTitle children={`New Quote`} btn={<BackBtn route={`/quotes`} />}/>
            <div className="flex flex-col w-full md:grid md:grid-cols-3">
                <Form method="post"
                    ref={formRef}
                    className=" border border-stone-800 bg-stone-800 p-4 rounded-md text-stone-300/60 font-light md:w-72"
                >
                    <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold tracking-wider uppercase">
                            Quote *
                        </label>
                        <textarea
                        name="body"
                        rows={3}
                        className="min-w-xl text-stone-800 rounded-md border-2 border-stone-800 py-2 px-3 text-lg"
                        />
                        {actionData?.errors.body && (
                            <ActionDataError children={actionData.errors.body} />
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold tracking-wider uppercase">
                            Author *
                        </label>
                        <select name="authorId" className="bg-stone-700 rounded-sm p-1" onChange={(e) => onAuthorChange}>
                            {data.data.authors.map((author: Author) => (
                                <option key={author.id}  value={author.id}>{author.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 pb-2">
                        <label className="text-sm font-semibold tracking-wider uppercase">
                            Book *
                        </label>
                        <select name="bookId" className="bg-stone-700 rounded-sm p-1">
                            {data.data.book.filter((book: Book) => book.authorId === authorId).map((book: Book) =>(
                                <option key={book.id} value={book.id}>{book.title}</option>
                            ))}
                        </select>
                        {actionData?.errors.bookId && (
                            <ActionDataError children={actionData.errors.bookId}/>
                        )}
                    </div>
                    <input hidden type="text" name="pricingPlan" defaultValue={data.data.pricingPlan}/>
                    <input hidden type="number" name="quoteCount" defaultValue={data.data._count.quotes}/>
                    </div>
                    {actionData?.errors.pricingPlan && (
                            <ActionDataError children={actionData.errors.pricingPlan}/>
                    )}
                    <div className="flex flex-col pt-4">
                        <button type="submit" name="_method" value="create" disabled={isAdding} >
                            <PrimaryActionBtn children={isAdding ? "Adding..." : "Add Quote"} />
                        </button>
                    </div>
                    
                </Form>
            </div>
        </div>
    )
}