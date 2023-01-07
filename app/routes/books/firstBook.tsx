import { useActionData, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";
import PageTitle from "~/components/PageTitle";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import BookErrorBackBtn from "~/components/Buttons/BookErrorBackBtn";
import FirstBookCard from "~/components/Books/FirstBookCard";

export const loader: LoaderFunction = async ({request}) => {
    const userId = await requireUserId(request);
    // const user = await getUser(request)
    const user = await prisma.user.findUnique({
        where: {id: userId},
        include:{
            _count: {
                select: {
                    book: true
                }
            }
        }
    })
    const authors = await prisma.author.findMany({where: {userId: userId}})
    
    return {authors, user}
}

export const action: ActionFunction = async ({request}) => {
    const userId = await requireUserId(request);
    const form = await request.formData()
    // const authorId = form.get('authorId') as string
    const name = form.get('name') as string
    const title = form.get('title') as string
    // const imgUrl = form.get('imgUrl') as string
    const imgUrl = 'https://neelkanthpublishers.com/assets/bookcover_thumb.png'
    const ISBN = form.get('ISBN') as string
    const pricingPlan = form.get('pricingPlan') as string
    const bookCount = form.get('bookCount') || 0
    console.log(bookCount)

    const errors = {
        title: '',
        imgUrl: '',
        ISBN: '',
        pricingPlan: '',
        name: ''
    }

    function validatePricingPlan() {
        if(pricingPlan === 'free' && bookCount > 4) {
            return errors.pricingPlan = `Upgrade your Pricing Plan`
        } else if (pricingPlan === 'pro' && bookCount > 19) {
            return errors.pricingPlan = `Upgrade your Pricing Plan`
        }
    }

    validatePricingPlan()

    function checkTitleName(title: string) {
        if(!title || title.length < 3) {
            return errors.title = `Title too short`
        }
    }

    checkTitleName(title)

    function checkName(title: string) {
        if(!name || name.length < 3) {
            return errors.name = `Name too short`
        }
    }

    checkName(title)

    // const isValidImageUrl = new RegExp('(jpe?g|png|gif|bmp)$')

    // const validateImageUrl = (value: string) => {
    //     if (!isValidImageUrl.test(value)) {
    //         return errors.imgUrl = `Not a valid Image URL`
    //     }
    // }

    // validateImageUrl(imgUrl)

    const isValidISBN = new RegExp('(^(97(8|9))?\\d{9}(\\d|X)$)|^$')

    const validateISBN = (value: string) => {
        if (!isValidISBN.test(value)) {
            return errors.ISBN = `Not a valid ISBN`
        }
    }

    validateISBN(ISBN)

    if (errors.title || errors.imgUrl || errors.ISBN || errors.pricingPlan) {
        const values = Object.fromEntries(form)
        return { errors, values }
    }

    const author = await prisma.author.create({
        data: {
            name: name,
            userId: userId,
            
        }
    })

    const fields = { authorId: author.id, title, imgUrl, userId, ISBN }

    const book = await prisma.book.create({ data: fields})
    return redirect(`/books/${book.id}`)
}

export default function FirstBook(): JSX.Element {
    const data = useLoaderData()
    const actionData = useActionData()

    console.log('first book route --> ', data)
    
    return (
        <div className="flex flex-col pt-6 md:pt-10 md:max-w-5xl pb-6">
            <PageTitle children={`New Book`} btn={<BookErrorBackBtn />}/>
            <div className="flex flex-col w-full md:grid md:grid-cols-3">
                <FirstBookCard data={data} actionData={actionData}/>
            </div>
        </div>
    )
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);
  
    return (
        <div className="flex flex-col pt-6 md:pt-10 md:max-w-5xl pb-6">
            <PageTitle children={`New Book`} btn={<BookErrorBackBtn />}/>
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