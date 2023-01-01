import { Form, useTransition } from "@remix-run/react";
import { useEffect, useRef } from "react";
import PrimaryActionBtn from "../Buttons/PrimaryActionBtn";
import ActionDataError from "../Forms/ActionDataError";
import ActionDataInput from "../Forms/ActionDataInput";
import FormInput from "../Forms/FormInput";


export type Author = {
    name: string
    id: string
}

export type ActionData = {
    errors: {
        title: string
        imgUrl: string
        ISBN: string
        pricingPlan: string
    }
}

export type Data = {
    authors: [{
        id: string
        imgUrl: string
        name: string
        userId: string
    }]
    user: {
        pricingPlan: string
        _count: {
            book: number
        }
    }
}

export type NewBookCardType = {
    data: Data
    actionData: ActionData
}
// export default function NewBookCard({data, onAuthorChange,  actionData}: any)
export default function NewBookCard({data, actionData}: NewBookCardType) {
    let transition = useTransition()
    let isAdding = 
        transition.state === "submitting" &&
        transition.submission.formData.get("_method") === "create"

    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (!isAdding) {
            formRef.current?.reset();
        } 
    },[isAdding])

    console.log('newbookcard', data)
    return (
        <div className="col-span-1">
            <Form method="post"
                ref={formRef}
                className="flex flex-col sm:w-96 gap-6 border-2 border-stone-800 bg-stone-800 p-4 rounded-md text-stone-300/60 font-light"
            >
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        {actionData?.errors.pricingPlan ? 
                        <ActionDataError children={actionData.errors.pricingPlan} />
                        :
                        null
                        }
                        <label className="text-sm font-semibold tracking-wider uppercase">
                            Title
                        </label>
                        {actionData?.errors.title ? (
                            <div className="flex flex-col">
                                <ActionDataInput type="text" name="title" defaultValue={""}/>
                                <ActionDataError children={actionData.errors.title} />
                            </div>
                        ) : 
                            <FormInput type="text" name="title" defaultValue={""}/>
                        }
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold tracking-wider uppercase">
                            Author
                        </label>
                        <select name="authorId" className="bg-stone-700 border border-stone-700 rounded-sm p-1" >
                            {data.authors.map((author: Author) => (
                                <option key={author.id}  value={author.id}>{author.name}</option>
                        ))}
                        </select>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold tracking-wider uppercase">
                            Book Image URL
                        </label>
                        {actionData?.errors.imgUrl ? (
                            <div className="flex flex-col">
                                <ActionDataInput type="text" name="imgUrl" defaultValue={""}/>
                                <ActionDataError children={actionData.errors.imgUrl} />
                            </div>
                        ) : 
                            <FormInput type="text" name="imgUrl" defaultValue={""}/>
                        }
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold tracking-wider uppercase">
                            ISBN
                        </label>
                        {actionData?.errors.ISBN ? (
                            <div className="flex flex-col">
                                <ActionDataInput type="text" name="ISBN" defaultValue={""}/>
                                <ActionDataError children={actionData.errors.ISBN} />
                            </div>
                        ) : 
                            <FormInput type="text" name="ISBN" defaultValue={""}/>
                            
                        }
                    </div>
                    <input type="text" hidden name="pricingPlan" defaultValue={data.user.pricingPlan} />
                    <input type="number" hidden name="bookCount" defaultValue={data.user._count.book} />
                </div>           
                <div className="flex flex-col">
                    <button 
                        type="submit" name="_method" value="create" disabled={isAdding}>
                        <PrimaryActionBtn children={isAdding ? "Adding..." : "Add Book"}/>
                    </button>
                </div>
            </Form>
        </div>
    )
}