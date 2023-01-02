export default function NoteSectionTitle({children, btn}: any) {
    return (
        <div className="mb-6 flex flex-col">
            <div className="flex justify-between items-center">
                <h3 className="text-base lg:text-lg tracking-wide font-light ">
                    {children}
                </h3>
                <div>{btn}</div>
            </div>
            {/* <hr className="my-1 border-stone-800 border-b-1" /> */}
        </div>
    )
}