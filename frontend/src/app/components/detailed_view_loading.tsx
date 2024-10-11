import React from "react";
import Link from "next/link";
import {parseSizes} from "@/app/lib/utils";


const DetailedViewLoadingComponent = () => {

    return (
        <>
            <div className="flex flex-row p-5">
                <div className="flex blur-lg">
                    <div
                        className="w-80 h-80 min-w-80 min-h-80 rounded-xl mb-4 bg-sneakers-first animate-pulse">
                    </div>
                </div>
                <div
                    className="ml-12 flex flex-col gap-5 blur-lg animate-pulse">
                    <h1 className="text-xl font-bold">Shoe name</h1>
                    <p className="text-lg text-green-300">Price:
                        $shoe price</p>
                    <div className="mt-4 w-3/4">
                        <p className="text-gray-500 hover:underline text-lg">Size
                            guide</p>
                        <span className="">
                                shoe article - Available sizes
                            </span>
                        <div
                            className="mt-2 text-lg p-2 rounded-2xl text-gray-500 flex flex-row flex-wrap flex-1 gap-1 w-3/4 overflow-clip"
                        >
                            <span
                                className={`border border-gray-300 rounded-md w-20 text-gray-400 p-4 text-center text-xl bg-sneakers-first`}
                            >
                                        size
                                    </span>
                            <span
                                className={`border border-gray-300 rounded-md w-20 text-gray-400 p-4 text-center text-xl bg-sneakers-first`}
                            >
                                        size
                                    </span>
                        </div>
                    </div>
                    <div>
                        <div>
                            <p className="mt-5 text-lg font-bold">Shipping</p>
                            You'll see shipping options at checkout.
                        </div>
                        <div className="mt-10">
                            <p className="text-lg font-bold">Free Pickup</p>
                            Find a Store at product page.
                        </div>
                    </div>
                    <div
                        className="flex mt-10 w-4/5">
                        <p className="text-lg mb-4">Carve a new lane for
                            yourself
                            in the Zoom Vomero 5—your go-to for complexity,
                            depth
                            and classic early 2000s aesthetics. The richly
                            layered design combines breathable and durable
                            materials with the comfort of Air Zoom cushioning
                            for
                            one of the coolest sneakers of the season.</p>
                    </div>
                </div>
            </div>
        </>
    )
};

export default DetailedViewLoadingComponent;
