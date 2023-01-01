import { Outlet, useCatch, useLoaderData, useParams } from "@remix-run/react"
import { redirect } from "@remix-run/server-runtime"
import EditNoteBtn from "~/components/Buttons/EditNoteBtn"
import QuoteNoteDeleteCard from "~/components/Notes/QuoteNoteDeleteCard"
import QuoteNoteQuoteCard from "~/components/Notes/QuoteNoteQuoteCard"
import PageTitle from "~/components/PageTitle"
import { prisma } from "~/db.server"

export const loader = async ({params}: any) => {
    const data = await prisma.quoteNote.findUnique({
        where: {id: params.quoteNoteId},
        include: {
            quote: true,
            author: true,
            book: true,
        }
    })

    if (!data) {
        throw new Response("Can't find note.", {
            status: 404,
        })
    }
    
    return {data}
}

export const action = async ({ request, params }: any) => {
    const note = await request.formData()

    if (note.get('_method') === 'delete') {
        await prisma.quoteNote.delete({ 
            where: { id: params.quoteNoteId }
        })
        return redirect(`/quoteNotes`)
    }
}



export default function QuoteNoteId() {
    const data = useLoaderData()

    return (
        <div className="flex flex-col pt-6 md:pt-10 md:max-w-5xl pb-6">
            <PageTitle children={`Note`}  />

            <div className="flex flex-col w-full md:grid md:grid-cols-3">

                <div className="flex flex-col col-span-2 pb-4 md:pr-4">
                    <Outlet />
                </div>
                <div className="flex flex-col gap-6 col-end-4 col-span-1">
                    <QuoteNoteQuoteCard data={data}/>
                    <QuoteNoteDeleteCard quoteNote={data}/>
                </div>
            </div>
        </div>
    )
}

export function CatchBoundary() {
    const caught = useCatch();
    const params = useParams();
    if (caught.status === 404) {
      return (
        <div className="flex flex-col pt-6 md:pt-10 md:max-w-5xl pb-6">
            <PageTitle children={`Note`}/>
            <div className="flex flex-col w-full md:grid md:grid-cols-3">
                <div className="flex flex-col col-span-2 pb-4 md:pr-4">
                    <div className='flex flex-col justify-center p-10 border border-red-500 text-red-500 rounded-sm text-center w-full'>
                        <p className="font-semibold tracking-wide">{`Can't find note ${params.quoteNoteId}`}</p>
                    </div>
                </div>
            </div>
        </div>
      );
    }
    throw new Error(`Unhandled error: ${caught.status}`);
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);
  
    return (
        <div className="flex flex-col pt-6 md:pt-10 max-w-5xl">
            <PageTitle children={`Note`}/>
            <div className='flex flex-col max-w-xl justify-center py-10 px-6  border border-red-500 text-red-500 rounded-lg text-center'>
                <p className="text-sm font-semibold tracking-wide">{`Looks like an error: ${error}`}</p>
            </div>
        </div>
    );
}
