export default function PageTitle({children, btn}: any) {
    return (
        <div className="mb-6 flex flex-col">
            <div className="flex justify-between items-center">
                <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl tracking-wide font-semibold ">
                    {children}
                </h3>
                <div>{btn}</div>
            </div>
            <hr className="my-4 border-stone-800 border-b-2" />
        </div>
    )
}