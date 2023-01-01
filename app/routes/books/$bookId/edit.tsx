import { Link, useActionData, useLoaderData, useTransition } from "@remix-run/react"
import { prisma } from "~/db.server"
import { requireUserId } from "~/session.server";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import UpdateBtn from "~/components/Buttons/UpdateBtn";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import { deleteBook } from "~/models/book.server";
import ActionDataInput from "~/components/Forms/ActionDataInput";
import ActionDataError from "~/components/Forms/ActionDataError";
import FormInput from "~/components/Forms/FormInput";

export const loader: LoaderFunction = async ({params, request}) => {
    const userId = await requireUserId(request);
    const data = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            book: {
                where: { id: params.bookId},
                include: {
                    author: true,
                }
            },
            authors: {
                where: { userId: userId}
            }
          }
    })
    return {data}
}

export const action: ActionFunction = async ({request, params}) => {
    const userId = await requireUserId(request);
    invariant(params.bookId, "bookId not found");
    const form = await request.formData()
    const selectAuthorId = form.get('selectAuthorId') as string
    const bookId = form.get('bookId') as string
    const title = form.get('title') as string
    const imgUrl = form.get('imgUrl') as string
    const ISBN = form.get('ISBN') as string
    const selectAuthorName = form.get('selectAuthorName') as string
    console.log(Object.fromEntries(form))

    // Action to update Book
    if (form.get('_method') === 'update') {
        const authorId = selectAuthorId
        const authorName = selectAuthorName

        const errors = {
            title: '',
            imgUrl: '',
            ISBN: ''
        }

        function checkTitleName(title: string) {
            if(!title || title.length < 3) {
                return errors.title = `Title too short`
            }
        }

        checkTitleName(title)


        const isValidImageUrl = new RegExp('(jpe?g|png|gif|bmp|jpg)$')

        const validateImageUrl = (value: string) => {
            if (!isValidImageUrl.test(value)) {
                return errors.imgUrl = `Not a valid Image URL`
            }
        
        }

        validateImageUrl(imgUrl)

        const isValidISBN = new RegExp('(ISBN[-]*(1[03])*[ ]*(: ){0,1})*(([0-9Xx][- ]*){13}|([0-9Xx][- ]*){10})')

        const validateISBN = (value: string) => {
            if (!isValidISBN.test(value)) {
                return errors.ISBN = `Not a valid ISBN`
            }
        }

        if (errors.title || errors.imgUrl || errors.ISBN) {
            const values = Object.fromEntries(form)
            return { errors, values }
        }

        validateISBN(ISBN)

        await prisma.book.update({
            where: { id: bookId },
            data: { title: title, authorId: authorId, imgUrl: imgUrl, authorName: authorName, ISBN: ISBN }
        })

        await prisma.quote.updateMany({ 
            where: { bookId: bookId },
            data: { authorId: authorId }
        })

        return redirect(`/books`)

    }

    // Action to delete Book
    if(form.get('_method') === 'deleteBook') {
        // await prisma.book.delete({where: {id: bookId}})
        await deleteBook({ userId, id: params.bookId })
        return redirect(`/books`)
    }

}



export default function EditBook() {
    const data = useLoaderData()
    const actionData = useActionData()
    let transition = useTransition()

    let isDeleting = 
        transition.state === "submitting" &&
        transition.submission.formData.get("_method") === "deleteBook"

    let isUpdating = 
        transition.state === "submitting" &&
        transition.submission.formData.get("_method") === "update"


    const formRef = useRef<HTMLFormElement>(null)
    const [willDelete, setWillDelete] = useState(false)

    useEffect(() => {
        if (!isUpdating) {
            formRef.current?.reset();
        }

    },[isUpdating])
    

    console.log('bookId Edit data --> ', data)
    return (
        <div className="grid grid-cols-1">
        <div className="flex flex-col py-6 px-4 border-2 border-stone-800 bg-stone-800 rounded-md ">
            <div className="flex flex-col gap-4 md:w-80">
            <Form method="post" ref={formRef}>
                <div className="flex flex-col">
                    <div className="flex w-full justify-between pb-4">
                        <Link to={`/books/${data.data.book[0].id}`} className=" hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Link>

                        <div onClick={() => setWillDelete(!willDelete)} className=" hover:text-white hover:cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold tracking-wider uppercase">
                                Title
                            </label>
                            {actionData?.errors.title ? (
                                <div className="flex flex-col">
                                    <ActionDataInput type="text" name="title" defaultValue={data.data.book[0].title}/>
                                    <ActionDataError children={actionData.errors.title} />
                                </div>
                            ) : 
                                <FormInput type="text" name="title" defaultValue={data.data.book[0].title}/>
                            }
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold tracking-wider uppercase">
                                Author
                            </label>
                            <select name="selectAuthorId" className="bg-stone-700 rounded py-2 px-1" >
                                <option value={data.data.book[0].authorId}>{data.data.book[0].author.name}</option>

                                {data.data.authors.filter((author: any) => author.id !== data.data.book[0].authorId).map((author: any) => (
                                    <option key={author.id}  value={author.id}>{author.name}</option>
                            ))}
                            </select>
                        </div>
                
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold tracking-wider uppercase">
                                Image URL
                            </label>
                            {actionData?.errors.imgUrl ? (
                                <div className="flex flex-col">
                                    <ActionDataInput type="text" name="imgUrl" defaultValue={data.data.book[0].imgUrl}/>
                                    <ActionDataError children={actionData.errors.imgUrl} />
                                </div>
                            ) : 
                                <FormInput type="text" name="imgUrl" defaultValue={data.data.book[0].imgUrl}/>
                                
                            }
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold tracking-wider uppercase">
                                ISBN
                            </label>
                            {actionData?.errors.ISBN ? (
                                <div className="flex flex-col">
                                    <ActionDataInput type="text" name="ISBN" defaultValue={data.data.book[0].ISBN}/>
                                    <ActionDataError children={actionData.errors.ISBN} />
                                </div>
                            ) : 
                                <FormInput type="text" name="ISBN" defaultValue={data.data.book[0].ISBN}/>
                                
                            }
                        </div>

                        <div className="hidden">
                            <input type="hidden" name="bookId" value={data.data.book[0].id}/>
                        </div>
                    </div>
                    <div className="flex mt-6">
                        {!willDelete ?
                        <div className="flex">
                            <button 
                                type="submit" name="_method" value="update" disabled={isUpdating || isDeleting} >
                                <UpdateBtn children={isUpdating ? "Updating..." : "Update Book"} />
                            </button> 
                        </div> 
                        :
                        <button 
                            type="submit" name="_method" value="deleteBook" disabled={isUpdating || isDeleting}
                            className="py-2 px-2 flex justify-center gap-2 items-center text-sm text-white rounded bg-red-400 border-2 border-red-400 hover:bg-red-600 hover:border-red-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            {isDeleting ? "Deleting..." : "Delete Book"}
                        </button> 
                        }
                    </div>
                </div>
            </Form>
            </div>
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