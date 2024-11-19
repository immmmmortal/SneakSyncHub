"use client";

import React, { useEffect, useState } from "react";
import { Shoe } from "@/app/interfaces/interfaces";
import Link from "next/link";
import { parseSizes } from "@/app/lib/utils";
import DetailedViewLoadingComponent from "@/app/components/detailed_view_loading"; // Assuming you have an interface for the shoe
import PriceTrendChart from "@/app/components/price_history";
import Image from "next/image";

interface ShoeDetailPageProps {
  params: {
    article: string;
  };
}

const ShoeDetailPage = ({ params }: ShoeDetailPageProps) => {
  const { article } = params; // Article is passed as a parameter
  const [shoe, setShoe] = useState<Shoe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const { v4: uuidv4 } = require("uuid");

  useEffect(() => {
    // Fetch shoe details by article
    const fetchShoeByArticle = async () => {
      try {
        const response = await fetch(
          `https://localhost:8000/api/shoes/${article}`,
          {
            method: "GET",
            credentials: "include", // Include cookies if needed
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch shoe details: ${response.statusText}`,
          );
        }

        const data = await response.json();
        setShoe(data);
      } catch (error) {
        console.error("Error fetching shoe:", error);
        setError(true); // Set error state if the fetch fails
      } finally {
        setLoading(false); // Set loading to false after fetch completes
      }
    };

    fetchShoeByArticle(); // Call the function to fetch shoe data
  }, [article]); // Re-run the effect when the article changes

  // Handle error state
  if (error || !shoe) {
    return (
      <div className="w-full h-full flex items-center justify-center text-2xl">
        404 - Shoe Not Found
      </div>
    ); // Display error or 404 if shoe is not found
  }

  // Render the shoe details if data is successfully fetched
  return (
    <div className="">
      <div>
        <h1 className="text-3xl font-bold mb-4">Detailed view</h1>
      </div>
      {loading ? (
        <>
          <DetailedViewLoadingComponent />
        </>
      ) : (
        <>
          <div className="flex flex-row p-5">
            <div className="flex">
              <Link href={shoe.url} className="min-w-80 w-80 h-80 min-h-80">
                <Image
                  src={shoe.image}
                  width="400"
                  height="400"
                  alt="{shoe.name}"
                  className="w-96 h-96 min-w-80 min-h-80 rounded-xl object-cover mb-4"
                />
              </Link>
            </div>
            <div className="ml-12 flex flex-col gap-5">
              <h1 className="text-xl font-bold">{shoe.name}</h1>
              <p className="text-lg text-green-300">Price: ${shoe.price}</p>
              <div className="mt-4 w-3/4">
                <Link
                  className="flex w-fit"
                  href={
                    shoe.parsed_from === "Adidas"
                      ? "https://www.adidas.com/us/help/size_charts/men-shoes"
                      : "https://www.nike.com/size-fit/unisex-footwear-mens-based"
                  }
                >
                  <p className="text-gray-500 hover:underline text-lg">
                    Size guide
                  </p>
                </Link>

                <span className="flex">{shoe.article} - Available sizes</span>
                <div className="mt-2 text-lg p-2 rounded-2xl text-gray-500 flex flex-row flex-wrap flex-1 gap-1 w-3/4 overflow-clip min-w-fit">
                  {parseSizes(shoe.sizes).map((size) => (
                    <span
                      key={uuidv4()}
                      className={`border border-gray-300 rounded-md w-20 text-gray-400 p-4 text-center text-xl bg-sneakers-first`}
                    >
                      {size}
                    </span>
                  ))}
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
              <div className="flex mt-10 w-4/5">
                <p className="text-lg mb-4">{shoe.description}</p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-8">Price History</h2>
            {shoe.price_history.length > 0 ? (
              <PriceTrendChart priceHistory={shoe.price_history} />
            ) : (
              <p className="pb-10">No price history available for this shoe.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ShoeDetailPage;
