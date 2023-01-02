import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import * as postA from "../../../public/blog/5-tips-to-remember-what-you-read.mdx"
import * as postB from "../../../public/blog/how-to-tweet-a-book-review.mdx"
import * as postC from "../../../public/blog/how-to-take-notes-on-a-book.mdx"


export default function Blog() {
    console.log('blog landing ->')
    return (
        <>
            <div className="flex flex-col w-full py-36 bg-stone-900">
                <div className="mx-auto max-w-5xl px-4">
                    <h2 className="text-4xl text-stone-200 font-thin text-center pb-10">The Blog</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Link to={`/blog/5-tips-to-remember-what-you-read`} className="flex flex-col rounded-lg">
                            <img src="/blog/5-tips-to-remember-what-you-read.jpg" alt=""
                                className="rounded-lg pb-4"
                            />
                            <div className="flex flex-col gap-2 mb-4">
                                <p className="font-semibold text-lg text-blue-400">5 Tips on note taking while reading</p>
                                <p className="text-base text-stone-200 font-light">Taking notes while reading is difficult to do if you don't know how to do it. Here are 5 tips on improving your note taking skills.</p>
                            </div>
                            <div className="flex gap-1 items-center mt-auto text-blue-400">
                                <p>Read more</p>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                </svg>
                            </div>
                        </Link>
                        <Link to={`/blog/how-to-tweet-a-book-review`} className="flex flex-col rounded-lg">
                            <img src="/blog/how-to-tweet-a-book-review.jpg" alt=""
                                className="rounded-lg pb-4"
                            />
                            <div className="flex flex-col gap-2 mb-4">
                                <p className="font-semibold text-lg text-blue-400">5 Tips on note taking while reading</p>
                                <p className="text-base text-stone-200 font-light">Taking notes while reading is difficult to do if you don't know how to do it. Here are 5 tips on improving your note taking skills.</p>
                            </div>
                            <div className="flex gap-1 items-center mt-auto text-blue-400">
                                <p>Read more</p>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                </svg>
                            </div>
                        </Link>
                        <Link to={`/blog/how-to-take-notes-on-a-book`} className="flex flex-col rounded-lg">
                            <img src="/blog/how-to-take-notes-on-a-book.jpg" alt=""
                                className="rounded-lg pb-4"
                            />
                            <div className="flex flex-col gap-2 mb-4">
                                <p className="font-semibold text-lg text-blue-400">5 Tips on note taking while reading</p>
                                <p className="text-base text-stone-200 font-light">Taking notes while reading is difficult to do if you don't know how to do it. Here are 5 tips on improving your note taking skills.</p>
                            </div>
                            <div className="flex gap-1 items-center mt-auto text-blue-400">
                                <p>Read more</p>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                </svg>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}



