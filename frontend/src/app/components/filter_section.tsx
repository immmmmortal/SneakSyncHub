const FilterSectionComponent = () => {

    return (
        <div
            className="bg-sneakers-first rounded-2xl min-w-48 p-3 max-w-52 flex-grow">
            <div>
                <input
                    placeholder="Filter by..."
                    className="placeholder:text-gray-400 placeholder:m bg-sneakers-second p-2 focus:outline-none text-white h-12 rounded-xl w-full"/>
            </div>
        </div>
    )
}

export default FilterSectionComponent;