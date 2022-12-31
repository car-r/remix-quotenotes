import { useActionData, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";
import { prisma } from "~/db.server"
import { requireUserId } from "~/session.server";
import PageTitle from "~/components/PageTitle";
import AuthorErrorBackBtn from "~/components/Buttons/AuthorErrorBackBtn";
import BackBtn from "~/components/Buttons/BackBtn";
import NewAuthorCard from "~/components/Authors/NewAuthorCard";


export const action = async ({request}: any) => {
    const form = await request.formData()
    const name = form.get('name')
    const imgUrl = form.get('imgUrl')
    const userId = await requireUserId(request);

    const errors = {
        name: '',
        imgUrl: '',
    }

    function checkAuthorName(name: string) {
        if(!name || name.length < 3) {
            return errors.name = `Author name too short`
        }
    }

    checkAuthorName(name)

    const isValidImageUrl = new RegExp('(jpe?g|png|gif|bmp)$')

    const validateImageUrl = (value: string) => {
        if (!isValidImageUrl.test(value)) {
            return errors.imgUrl = `Not a valid Image URL`
        }
    }

    validateImageUrl(imgUrl)

    if (errors.name || errors.imgUrl) {
        const values = Object.fromEntries(form)
        return { errors, values }
    }

    const fields = { name, imgUrl, userId }

    const author = await prisma.author.create({ data: fields})
    return redirect(`/authors/${author.id}`)
}

export default function NewAuthor() {
    const actionData = useActionData()
    const data = useLoaderData()
    console.log(actionData)
    return (
        <div className="flex flex-col pt-6 md:pt-10 md:max-w-5xl pb-6">
            <PageTitle children={`New Author`} btn={<BackBtn route={`/authors`} />}/>
            <div className="flex flex-col w-full md:grid md:grid-cols-4">
                <div className="col-span-1">
                    <NewAuthorCard actionData={actionData} />
                </div>
            </div>
        </div>
    )
}

export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);
  
    return (
        <div className="flex flex-col pt-6 md:pt-10 md:max-w-5xl pb-6">
            <PageTitle children={`New Author`} btn={<AuthorErrorBackBtn />}/>
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
