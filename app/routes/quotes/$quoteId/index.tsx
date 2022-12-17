import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { requireUserId } from "~/session.server"
import { redirect } from "@remix-run/server-runtime";
import { useActionData, useLoaderData } from "@remix-run/react";
import { getQuoteWithAuthorAndBook, updateQuoteFavorite } from "~/models/quote.server";
import invariant from "tiny-invariant";
import QuoteCardLarge from "~/components/Quotes/QuoteCardLarge";

export const loader: LoaderFunction = async ({params, request}) => {
    const userId = await requireUserId(request)
    invariant(params.quoteId, "quoteId not found");

    const quote = await getQuoteWithAuthorAndBook({ userId, id: params.quoteId })

    if (!quote) {
        throw new Response("Can't find quote.", {
            status: 404,
        })
    }

    return {quote}
}

export const action: ActionFunction = async ({ request, params }) => {
    const userId = await requireUserId(request);
    invariant(params.quoteId, "quoteId not found");
    const form = await request.formData()
    const id = params.quoteId
    const isFavorited = form.get('isFavorited') as string
    // console.log(Object.fromEntries(form))

    await updateQuoteFavorite({ userId, id, isFavorited })
    return redirect(`/quotes/${id}`)
  
}

export default function QuoteIdHome() {
    const quote = useLoaderData()
    const actionData = useActionData()
    // console.log('quoteIndex --> ', quote)
    return (
        <div className="md:col-span-2">
            <QuoteCardLarge quote={quote} actionData={actionData}/>
        </div>
    )
}