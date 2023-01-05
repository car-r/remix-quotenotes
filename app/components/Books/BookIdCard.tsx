import { Link } from "@remix-run/react";

export type Data = {
    data: {
        data: {
            ISBN: string
            authorId: string
            id: string
            imgUrl: string
            title: string
            author: {
                name: string
            }
        }
        
    }
}

const imageOnErrorHandler = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    event.currentTarget.src = 'https://neelkanthpublishers.com/assets/bookcover_thumb.png';
    event.currentTarget.className = "error";
};

export default function BookIdCard({data}: Data) {

    return (
        <div className="flex flex-col p-4 bg-stone-800 rounded-lg max-w-3xl md:max-w-sm">
            <div className="flex flex-col pb-3">
                <img src={data.data.imgUrl} alt={data.data.title}
                    onError={imageOnErrorHandler}
                    className="object-fit md:max-w-xs " 
                />
            </div>
             <div>
                <div className="flex ">
                    <p className="font-bold w-10/12">
                        {data.data.title}
                    </p>
                </div>
                <div className="flex">
                    <Link to={`/authors/${data.data.authorId}`}>
                        <p className="text-sm font-thin tracking-wider hover:text-stone-100">
                            {data.data.author.name}
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    )
}