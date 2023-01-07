
import { prisma } from "~/db.server";
import type { LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import type { Quote, Author } from "@prisma/client";
import { Link, useLoaderData } from "@remix-run/react";
import PageTitle from "~/components/PageTitle";
import SectionTitle from "~/components/SectionTitle";
import QuoteSmallCard from "~/components/Quotes/QuoteSmallCard";
import FirstQuoteBtn from "~/components/Buttons/FirstQuoteBtn";
import AddQuoteBtn from "~/components/Buttons/AddQuoteBtn";
import BookHomeCard from "~/components/Books/BookHomeCard";
// import AddBookBtn from "~/components/Buttons/AddBookBtn";
import AddAuthorBtn from "~/components/Buttons/AddAuthorBtn";
import AuthorHomeCard from "~/components/Authors/AuthorHomeCard";
import AppLayout from "~/components/Layouts/AppLayout";
import { getUserById } from "~/models/user.server";
import FirstBookBtn from "~/components/Buttons/FirstBookBtn";

export const loader: LoaderFunction = async ({request}) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId)
  const userData = await prisma.user.findUnique({
    where: {id: userId},
    include: {
      _count: {
        select: {
          quotes: true,
          authors: true,
          book: true,
          quoteNote: true
        }
      },
      quotes: {
        take: 10,
        orderBy: {
          note: {
            '_count': 'desc'
          }
        }
      },
      authors: {
        orderBy: {
          quote: {
            '_count': 'desc'
          }
        }
      },
      book: {
        orderBy: {
          quote: {
            '_count': 'desc'
          }
        },
        include: {
          author: true
        }
      },
      quoteNote: true,
    }
  })
  return {userData, user}
}

export type Book = {
  id: string
  title: string
  imgUrl: string
  author: {
      name: string
  }
}

export default function Index() {
  const data = useLoaderData()

  return (
    <>
      <AppLayout>
      <div className="flex flex-col pt-6 md:pt-10 max-w-5xl">
        <PageTitle children={`Library`}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-28">
          <Link to="/quotes">
            <div className="border-2 border-stone-800 p-4 rounded-xl hover:ring-2 hover:ring-blue-400 hover:text-stone-100">
              <p className="uppercase text-sm font-light tracking-wider">Quotes</p>
              <p className="text-4xl">{data.userData._count.quotes}</p>
            </div>
          </Link>
          <Link to="/books">
            <div className="border-2 border-stone-800 p-4 rounded-xl hover:ring-2 hover:ring-blue-400 hover:text-stone-100">
              <p className="uppercase text-sm font-light tracking-wider">Books</p>
              <p className="text-4xl">{data.userData._count.book}</p>
            </div>
          </Link>
          <Link to="/authors">
            <div className="border-2 border-stone-800 p-4 rounded-xl hover:ring-2 hover:ring-blue-400 hover:text-stone-100">
              <p className="uppercase text-sm font-light tracking-wider">Authors</p>
              <p className="text-4xl">{data.userData._count.authors}</p>
            </div>
          </Link>
          <Link to="/notes">
            <div className="border-2 border-stone-800 p-4 rounded-xl hover:ring-2 hover:ring-blue-400 hover:text-stone-100">
              <p className="uppercase text-sm font-light tracking-wider">Notes</p>
              <p className="text-4xl">{data.userData._count.quoteNote}</p>
            </div>
          </Link>
        </div>
        <div className="pb-28 flex flex-col">
          <div>
            {data.userData._count.authors < 1 ? 
              <SectionTitle children={'Quotes'} btn={<FirstQuoteBtn />}/>
              :
              <SectionTitle children={'Quotes'} btn={<AddQuoteBtn />}/>
            }
            <div className="flex overflow-auto pb-4 snap-x scrollbar-thin scrollbar-track-stone-800 scrollbar-thumb-stone-700">
              <div className="flex md:flex md:flex-row gap-4 mx-1">
                {data.userData.quotes.map((quote: Quote) => (
                  <Link to={`/quotes/${quote.id}`} key={quote.id} className="snap-start px-1">
                    <QuoteSmallCard quote={quote}/>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="pb-28 flex flex-col">
          <div>
            {data.userData._count.authors < 1 ? 
              <SectionTitle children={'Books'} btn={<FirstBookBtn />}/>
              :
              <SectionTitle children={'Books'} btn={<FirstBookBtn />}/>
            }
            
            <div className="flex overflow-auto pb-6 snap-x scrollbar-thin scrollbar-track-stone-800 scrollbar-thumb-stone-700 p-1 gap-4 ">
              {data.userData.book.map((book: Book) => (
                <Link to={`/books/${book.id}`} key={book.id} className="flex">
                  <BookHomeCard book={book} />
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="pb-28 flex flex-col">
          <div>
            <SectionTitle children={'Authors'} btn={<AddAuthorBtn />}/>
            <div className="flex gap-4 overflow-auto pb-6 snap-x scrollbar-thin scrollbar-track-stone-800 scrollbar-thumb-stone-700 p-1">
              {data.userData.authors.map((author: Author) => (
                <Link to={`/authors/${author.id}`} key={author.id} className=" snap-start px-1">
                  <AuthorHomeCard author={author}/>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      </AppLayout>
    </>
  );
}
