import {Shoe} from "@/app/interfaces/interfaces";
import Link from "next/link";
import {useOverflowDetector} from "react-detectable-overflow";
import {Tooltip} from 'react-tooltip';
import DeleteProductButtonComponent from "@/app/components/delete_product";
import {toast} from "react-toastify";


interface ArticleInfoComponentProps {
    shoes: Shoe[];
    handleDelete: (id: number) => Promise<void>;
}

const ArticleInfoComponent = ({
                                  shoes,
                                  handleDelete,
                              }: ArticleInfoComponentProps) => {
    const {ref, overflow} = useOverflowDetector();
    const {v4: uuidv4} = require('uuid');

    const parseSizes = (sizes: string): string[] => {
        try {
            return JSON.parse(sizes.replace(/'/g, '"'));
        } catch (e) {
            toast.error('Failed to parse sizes:' + e);
            return [];
        }
    };

    if (!Array.isArray(shoes) || shoes.length === 0) {
        return (
            <ul className="flex">
                <li className={`bg-sneakers-first h-56 min-h-fit rounded-2xl items-start flex flex-row mt-5 text-ellipsis overflow-hidden relative`}/>
            </ul>
        );
    }

    return (
        <ul className="flex-grow">
            {overflow && <Tooltip className="z-20" id="shoe-name"/>}
            {shoes.map(shoe => (
                <li key={shoe.id}
                    className={`bg-sneakers-first h-56 min-h-fit rounded-2xl items-start flex flex-row mt-5 text-ellipsis overflow-hidden relative`}>
                    <Link href={shoe.url} className="min-w-44 min-h-44">
                        <img
                            src={shoe.image}
                            alt={shoe.name}
                            className="min-h-44 min-w-44 max-h-56 max-w-56 flex"
                        />
                    </Link>
                    <div
                        className="flex flex-col h-auto p-3 min-h-[228px] flex-grow ml-4">
                        <div className="flex flex-row">
                            <div
                                ref={ref}
                                data-tooltip-id="shoe-name"
                                data-tooltip-content={shoe.name}
                                className={`text-lg hover:text-orange-500 transition-all w-fit overflow-hidden text-ellipsis h-8 duration-200 flex flex-grow font-semibold`}>
                                {shoe.name}
                            </div>
                            <DeleteProductButtonComponent
                                handleDelete={handleDelete} id={shoe.id}/>
                        </div>
                        <div className="text-md text-green-400">
                            {shoe.price}$
                        </div>
                        <div className="mt-4 max-w-56">
                            <span className="ml-2">
                                {shoe.article} -
                                Available sizes
                            </span>
                            <div
                                className="mt-2 text-lg bg-sneakers-second p-2 rounded-2xl text-gray-500 flex flex-row flex-wrap flex-1 gap-1 max-h-[96px] max-w-fit overflow-clip"
                            >
                                {parseSizes(shoe.sizes).map((size) => (
                                    <span
                                        key={uuidv4()}
                                        className={`border border-gray-300 rounded-md text-gray-400 h-6 p-1 text-xs bg-sneakers-first`}>
                                        {size}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default ArticleInfoComponent;
