"use client";

import { MdRefresh } from "react-icons/md";
import React, {useCallback, useEffect, useState } from "react";
import { Shoe } from "@/app/interfaces/interfaces";
import Link from "next/link";
import { calculateDiscount, parseSizes } from "@/app/lib/utils";
import DetailedViewLoadingComponent from "@/app/components/detailed_view_loading";
import PriceTrendChart from "@/app/components/price_history";
import Image from "next/image";
import { Tooltip } from "react-tooltip";

interface ShoeDetailPageProps {
  params: {
    article: string;
  };
}

const ShoeDetailPage = ({ params }: ShoeDetailPageProps) => {
  const { article } = params;
  const [shoe, setShoe] = useState<Shoe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const { v4: uuidv4 } = require("uuid");

  const fetchShoeByArticle = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://localhost/api/shoes/${article}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch shoe details: ${response.statusText}`);
      }

      const data = await response.json();
      setShoe(data);
    } catch (error) {
      console.error("Error fetching shoe:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [article]);

  useEffect(() => {
    fetchShoeByArticle();
  }, [article, fetchShoeByArticle]);

  const handleRefresh = async () => {
    if (!shoe) return;

    setError(false);
    setLoading(true);

    try {
      const response = await fetch(
        `https://localhost/api/shoes/${article}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parsed_from: shoe.parsed_from,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to refresh shoe data: ${response.statusText}`);
      }

      await fetchShoeByArticle();
    } catch (error) {
      console.error("Error refreshing shoe data:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };


  if (error || !shoe) {
    return (
      <div className="w-full h-full flex items-center justify-center text-2xl">
        404 - Shoe Not Found
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold mb-4">Detailed view</h1>
      </div>
      {loading ? (
        <DetailedViewLoadingComponent />
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
              <div className="flex items-center">
                <h1 className="text-xl font-bold">{shoe.name}</h1>
                {/* Refresh Icon */}
                <Tooltip id="refresh-shoe" className="z-10" />
                <button
                  onClick={handleRefresh}
                  className={`w-8 h-8 ml-4 rounded-full flex items-center justify-center ${loading ? "animate-spin" : ""}`}
                  data-tooltip-id="refresh-shoe"
                  data-tooltip-content={`Refresh shoe info from ${shoe.parsed_from}`}
                  disabled={loading}
                >
                  <MdRefresh
                    className={`w-10 h-10 ${loading ? "text-blue-500" : "text-gray-600"}`}
                  />
                </button>
              </div>

              {/* Price Display */}
              <div className="text-lg flex flex-row gap-2">
                {Number(shoe.sale_price) > 0 ? (
                  <>
                    <p className="text-lg font-bold flex">
                      ${Number(shoe.sale_price)}
                    </p>
                    <p className="text-lg text-gray-600 flex line-through">
                      ${Number(shoe.price)}
                    </p>
                    <p className="text-lg text-green-300 flex">
                      {calculateDiscount(
                        shoe.price,
                        shoe.sale_price,
                      )}
                      % off
                    </p>
                  </>
                ) : (
                  <p className="text-lg text-green-300">
                    Price: ${Number(shoe.price)}
                  </p>
                )}
              </div>

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
                  You&apos;ll see shipping options at checkout.
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

          {/* Refresh Icon (extra spinner for refresh action) */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-50 rounded-full">
              <svg
                className="w-10 h-10 animate-spin text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 12c0 5.523-4.477 10-10 10S3 17.523 3 12 7.477 2 12 2c2.732 0 5.185 1.051 7.071 2.929M21 12h-5"></path>
              </svg>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShoeDetailPage;
