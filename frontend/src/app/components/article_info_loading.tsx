import React from "react";


const ArticleInfoLoadingComponent = () => {

    return (
        <>
            <div className="relative flex flex-grow">
                <ul className="relative blur-sm flex-grow flex-col flex flex-wrap gap-4">
                    <li
                        className={`bg-sneakers-first h-56 min-h-fit rounded-2xl items-start flex flex-grow flex-row mt-5 text-ellipsis overflow-hidden relative`}>
                            <span
                                className="w-48 blur-0 flex bg-gray-600 self-center h-56 animate-pulse"></span>
                        <div
                            className="flex flex-col h-auto p-3 min-h-[228px] flex-grow ml-4">
                            <div className="flex flex-row">
                                <div
                                    className={`text-lg hover:text-orange-500 transition-all  w-fit overflow-hidden text-ellipsis h-8 duration-200 flex flex-grow font-semibold`}>
                                        <span
                                            className="flex w-4/5 rounded bg-gray-600 blur-sm animate-pulse">
                                        </span>
                                </div>
                            </div>
                            <div className="text-md text-green-400">
                                    <span
                                        className="flex w-1/12 mt-4 h-4 rounded-xl bg-gray-600 blur-sm animate-pulse">
                                    </span>
                            </div>
                            <div
                                className="mt-4 text-lg text-gray-500 flex flex-row flex-wrap flex-1 gap-1 max-h-[96px] max-w-fit overflow-clip">
                                <div
                                    className="mt-4 rounded-xl bg-gray-600 animate-pulse blur-sm w-40 h-22">
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </>
    )
};

export default ArticleInfoLoadingComponent;
