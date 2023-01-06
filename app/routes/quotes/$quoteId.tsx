import { Outlet, useActionData, useCatch, useLoaderData, useParams } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import PageTitle from "~/components/PageTitle";
import SectionTitle from "~/components/SectionTitle";

import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { redirect } from "@remix-run/server-runtime";
import { createQuoteNote, deleteQuote, updateQuote } from "~/models/quote.server";
import { getQuote } from "~/models/quote.server";
import invariant from "tiny-invariant";
import { createTag, deleteTag } from "~/models/tag.server";
import AddNoteCard from "~/components/Quotes/AddNoteCard";
import QuoteNoteGrid from "~/components/Notes/QuoteNoteGrid";
import QuoteTags from "~/components/Quotes/QuoteTags";
import EditQuoteBtn from "~/components/Buttons/EditQuoteBtn";
import QuoteErrorBackBtn from "~/components/Buttons/QuoteErrorBackBtn";




export const loader: LoaderFunction = async ({params, request}) => {
    const userId = await requireUserId(request);
    const user = await prisma.user.findUnique({
        where: {id: userId},
        include: {
            _count: {
                select: {
                    quoteNote: true
                }
            }
        }
    })

    invariant(params.quoteId, "quoteId not found");

    const quote = await getQuote({ userId, id: params.quoteId })

    if (!quote) {
        throw new Response("Can't find quote.", {
            status: 404,
        })
    }
    
    return {quote, user}

}

type ActionData = {
    errors: {
      body: string;
      tagBody: string
    };
};

export const action: ActionFunction = async ({ request, params }) => {
    const userId = await requireUserId(request);
    invariant(params.quoteId, "quoteId not found");
    
    const form = await request.formData()
    const formBody = form.get('body') as string
    const quoteBody = form.get('quoteBody') as string
    const authorId = form.get('authorId') as string
    const bookId = form.get('bookId') as string
    const id = params.quoteId as string
    const isFavorited = form.get('isFavorited') as string
    const tagBody = form.get('tagBody') as string
    const pricingPlan = form.get('pricingPlan') as string
    const quoteNoteCount = form.get('quoteNoteCount')  || 0
    const date: any = new Date
    const updatedAt = date.toISOString()
    console.log(Object.fromEntries(form))

    // Action to delete quote
    if(form.get('_method') === 'delete') {
        await deleteQuote({ userId, id: params.quoteId });
        // await prisma.quote.delete({ where: { id: params.quoteId}})
        return redirect('/quotes')
    }

    // Action to update quote
    if(form.get('_method') === 'update') {
        const body = quoteBody

        const errors = {
            body: ''
        }
    
        // validation check that the body isn't less than 4 characters
        function checkBody(body: any) {
            if(!body || body.length < 4) {
                return errors.body = `Quote too short`
            }
        }
    
        checkBody(body)
    
        if (errors.body) {
            const values = Object.fromEntries(form)
            return { errors, values }
        }

        // const fields = {body}
        // await prisma.quote.update({where: {id: params.quoteId}, data: fields})
        await updateQuote({ userId, id: params.quoteId, body})

        return redirect('/quotes')
    }


    // Action to create a quoteNote
    if(form.get('_method') === 'note') {
        const body = formBody
        const quoteId = params.quoteId

        const errors = {
            noteBody: '',
            pricingPlan: ''
        }

        function validatePricingPlan() {
            if (pricingPlan === 'free' && quoteNoteCount > 99) {
                return errors.pricingPlan = `Upgrade your Pricing Plan`
            } else if (pricingPlan === 'pro' && quoteNoteCount > 399) {
                return errors.pricingPlan = `Upgrade your Pricing Plan`
            }
        }

        validatePricingPlan()
    
        function checkBody(body: string) {
            if(!body || body.length < 4) {
                return errors.noteBody = `Note too short`
            }
        }
    
        checkBody(body)
    
        if (errors.noteBody || errors.pricingPlan) {
            const values = Object.fromEntries(form)
            return { errors, values }
        }

        // const fields = { body, quoteId, userId, authorId, bookId}
        // await prisma.quoteNote.create({ data: fields })
        await createQuoteNote({body, quoteId, userId, authorId, bookId})

        // update the createdAt date when a new note is added to a quote
        await prisma.quote.update({
            where: {id: quoteId},
            data: { updatedAt: updatedAt}
        })

        return redirect(`/quotes/${params.quoteId}`)
    }

    // Action to add tag
    if(form.get('_method') === 'tag') {
        const oldBody: string = tagBody
        const quoteId: string = params.quoteId

        const errors = {
            tagBody: ''
        }

        const body = oldBody.replace(/\s+/g, '-').toLowerCase()

        function checkBody(body: string) {
            if(!body || body.length < 3) {
                return errors.tagBody = `Tag too short`
            }
        }
    
        checkBody(body)

    
        if (errors.tagBody) {
            const values = Object.fromEntries(form)
            return { errors, values }
        }

        // const fields = {body, quoteId, userId, bookId}
        // await prisma.tag.create({ 
        //     data: fields
        // })
        await createTag({body, quoteId, userId, bookId})
        return redirect(`/quotes/${id}`)
    }
    
    // Action to delete tag
    if(form.get('_method') === 'deleteTag') {
        // const values = Object.fromEntries(form)
        const tagId = form.get('tagId') as string
        // await prisma.tag.delete({ where: { id: tagId }})
        await deleteTag({ id: tagId, userId })
        return redirect(`/quotes/${id}`)
    }

    // Action to update favorite status of quote
    if(form.get('_method') !== ('delete' || 'update' || 'note' || 'deleteTag' || 'tag') ) {
        await prisma.quote.update({
            where: { id: id },
            data: { isFavorited: isFavorited }
        })
        return redirect(`/quotes/${id}`)
    } 
}


export default function QuoteDetail() {
    const quote = useLoaderData()
    const actionData = useActionData() as ActionData

    return (
        <div className="flex flex-col pt-6 md:pt-10 max-w-5xl">
            <PageTitle children={`Quote`} btn={<EditQuoteBtn  data={quote} />}/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Outlet />
                <div className="flex flex-col gap-6">
                    <AddNoteCard quote={quote} actionData={actionData} />
                    <QuoteTags quote={quote} actionData={actionData} />
                </div>
            </div>
            <div className="mt-6 mb-28">
                <SectionTitle children={"Notes"}/>
                <QuoteNoteGrid quote={quote}/>
            </div>
        </div>
    )
}

export function CatchBoundary() {
    const caught = useCatch();
    const params = useParams();
    if (caught.status === 404) {
      return (
        <div className="flex flex-col pt-6 md:pt-10 max-w-5xl">
            <PageTitle children={`Quote`} btn={<QuoteErrorBackBtn />}/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                    <div className="p-4  border border-red-500 text-red-500 bg-stone-800 rounded-md ">
                        <p className="text-sm sm:text-xl text-center  italic font-semibold my-5 md:my-10">
                            {`Can't find quote ${params.quoteId}`}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-20 mb-28">
                <SectionTitle children={"Notes"}/>
            </div>
        </div>
      );
    }
    throw new Error(`Unhandled error: ${caught.status}`);
}