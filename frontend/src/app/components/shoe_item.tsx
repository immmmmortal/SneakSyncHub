// components/shoe_item.tsx
"use client";

import React, {useEffect, useRef, useState} from "react";
import {animated} from "@react-spring/web";
import Image from "next/image";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faEllipsisVertical, faSpinner,
  faTrashCan, faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {DesiredPrice, Shoe} from "@/app/interfaces/interfaces";
import {calculateDiscount, NumericInput} from "@/app/lib/utils";
import DeleteProductButtonComponent
  from "@/app/components/delete_product";

interface ShoeItemProps {
  shoe: Shoe;
  style: any;
  handleDelete: (id: number) => Promise<void>;
  desiredPrices: DesiredPrice[];
}

const parseShoeSizes = (sizes: string): string[] => {
  try {
    const sanitizedSizes = sizes.replace(/'/g, '"');
    const parsedSizes = JSON.parse(sanitizedSizes);
    return Array.isArray(parsedSizes) ? parsedSizes : [];
  } catch {
    return [];
  }
};

const ShoeItem = ({
  shoe,
  style,
  handleDelete,
  desiredPrices,
}: ShoeItemProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [salePercentage, setSalePercentage] = useState("");
  const [salePrice, setSalePrice] = useState(
    shoe.sale_price ? shoe.sale_price : shoe.price,
  );
  const [status, setStatus] = useState<"loading" | "success" | "error" | null>(
    null,
  );
  const [flatPrice, setFlatPrice] = useState("");
  const { v4: uuidv4 } = require("uuid");


  const sizes = parseShoeSizes(shoe.sizes);
  const finalPrice =
    salePercentage && Number(shoe.price)
      ? (Number(shoe.price) * (100 - Number(salePercentage))) / 100
      : Number(shoe.price);

  const desiredPrice = desiredPrices.find(
    (preference) => preference.shoe.id === shoe.id,
  )?.desired_price;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSetPrice = async () => {
    setStatus("loading");
    let desiredPrice: number | null = null;

    if (flatPrice && salePrice) {
      desiredPrice = Math.min(Number(flatPrice), Number(salePrice));
    } else if (flatPrice) {
      desiredPrice = Number(flatPrice);
    } else if (salePrice) {
      desiredPrice = Number(salePrice);
    }

    if (desiredPrice === null) {
      setStatus("error");
      return;
    }

    try {
      const response = await fetch(`https://localhost/api/create-preference/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          price: desiredPrice,
          shoe_article: shoe.article,
        }),
      });
      setStatus(response.ok ? "success" : "error");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <animated.li
            key={shoe.id}
            style={style}
            className={`item bg-sneakers-first max-h-48 h-48 rounded-2xl items-start flex flex-row mt-6 text-ellipsis overflow-hidden relative`}
          >
            <Link href={shoe.url} className="w-44 min-h-44 h-full">
              <div className="relative min-h-44 min-w-48">
                <Image
                  width="192"
                  height="192"
                  src={shoe.image}
                  alt={shoe.name}
                  className="min-h-44 min-w-44 max-h-56 w-48 max-w-56 flex object-cover"
                />
                {desiredPrice && (
                  <div className="absolute top-0 left-0 p-1 text-center bg-sneakers-first bg-opacity-35 w-full">
                    Desired Price: ${desiredPrice}
                  </div>
                )}
              </div>
            </Link>
            <div className="flex flex-col h-auto p-3 min-h-[224px] flex-grow ml-4">
              <div className="flex flex-row">
                <div
                  //@ts-ignore
                  data-tooltip-id="shoe-name"
                  data-tooltip-content={shoe.name}
                  className="text-lg hover:text-orange-500 transition-all w-fit overflow-hidden text-ellipsis h-8 duration-200 gap-2 flex flex-grow font-semibold"
                >
                  <Link href={`/shoes/${shoe.article}`}>{shoe.name}</Link>
                </div>
                <DeleteProductButtonComponent
                  handleDelete={() => handleDelete(shoe.id)}
                  id={shoe.id}
                />
              </div>
              <div className="text-lg flex flex-row gap-2 items-center relative">
                {Number(shoe.sale_price) > 0 ? (
                  <>
                    <p className="text-lg font-bold text-green-300 flex">
                      ${Number(shoe.sale_price)}
                    </p>
                    <p className="text-lg text-gray-600 flex line-through">
                      ${Number(shoe.price)}
                    </p>
                    <p className="text-lg flex">
                      {calculateDiscount(shoe.price, shoe.sale_price)}% off
                    </p>
                  </>
                ) : (
                  <div className="flex items-center h-7 flex-row gap-2">
                    <p className="flex text-lg text-green-300">
                      ${Number(shoe.price)}
                    </p>
                  </div>
                )}
                <FontAwesomeIcon
                  icon={faEllipsisVertical}
                  className="flex text-neutral-400 cursor-pointer"
                  onClick={() =>
                      // @ts-ignore
                    setMenuOpen((prev) => (prev === shoe.id ? null : shoe.id))
                  }
                />

                { // @ts-ignore
                  menuOpen === shoe.id && (
                  <div
                    ref={menuRef}
                    className="absolute -top-4 right-1 bg-sneakers-second
                     rounded-md shadow-md p-4 w-72 z-130"
                  >
                    <div className="">
                      <div className="flex flex-col items-center justify-center gap-0 mb-1">
                        <div>
                          {Number(shoe.sale_price) > 0 ? (
                            <p className="text-lg font-bold text-green-300 flex">
                              ${Number(shoe.sale_price)}
                            </p>
                          ) : (
                            <p className="flex text-lg text-green-300">
                              ${Number(shoe.price)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex flex-row w-full justify-between rounded-md [&_input]:p-1">
                          <div className="w-2/5 flex flex-row items-center">
                            <span className="border-b-2 py-1 flex">$</span>
                            <NumericInput
                              placeholder="Price"
                              className="bg-sneakers-second
                               text-green-500 w-full border-b-2 focus:outline-none
                                autofill:shadow-none autofill:bg-inherit autofill:text-inherit"
                              value={flatPrice} // Connect first
                              // input to
                              // state
                              onChange={(e) => {
                                const newPrice = e.target.value;
                                setFlatPrice(newPrice); // Update
                                // sale price state
                              }}
                            />
                          </div>
                          <div className="w-2/5 flex flex-row items-center">
                            <span className="border-b-2 py-1 flex">%</span>
                            <NumericInput
                              placeholder="Sale"
                              className="bg-sneakers-second  w-full border-b-2 focus:outline-none autofill:shadow-none autofill:bg-inherit autofill:text-inherit"
                              value={salePercentage} // Controlled value
                              onChange={(e) => {
                                const newPercentage = e.target.value;
                                setSalePercentage(newPercentage);

                                // Determine the initial price (sale price if available, else regular price)
                                const initialPrice =
                                  Number(shoe.sale_price) > 0
                                    ? Number(shoe.sale_price)
                                    : Number(shoe.price);

                                // Treat empty percentage input as 0
                                const parsedPercentage =
                                  newPercentage === ""
                                    ? 0
                                    : Number(newPercentage);

                                // Calculate the final price based on the percentage entered
                                if (
                                  initialPrice &&
                                  /^\d*$/.test(newPercentage)
                                ) {
                                  // Allow empty input or numeric values
                                  const discount =
                                    (initialPrice * parsedPercentage) / 100;
                                  setSalePrice(
                                    (initialPrice - discount).toFixed(2),
                                  );
                                }
                              }}
                            />
                            <span className="border-b-2 py-1  flex">|</span>
                            <NumericInput
                              placeholder=""
                              className={`bg-sneakers-second w-full
    ${
      Number(salePrice).toFixed(0) ===
      (Number(shoe.sale_price) > 0
        ? Number(shoe.sale_price).toFixed(0)
        : Number(shoe.price).toFixed(0))
        ? "text-neutral-400"
        : "text-green-500"
    }
    border-b-2 focus:outline-none autofill:shadow-none autofill:bg-inherit autofill:text-inherit`}
                              value={Number(salePrice).toFixed(0)}
                              isDisabled={true}
                            />
                          </div>
                        </div>
                        <div className="flex w-full justify-center mt-4">
                          <button
                            onClick={handleSetPrice}
                            className="flex rounded p-1.5 justify-center text-center bg-sneakers-button w-1/2"
                            disabled={status === "loading"}
                          >
                            {status === "loading" && (
                              <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin text-white"
                              />
                            )}
                            {status === "success" && (
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="text-white"
                              />
                            )}
                            {status === "error" && (
                              <FontAwesomeIcon
                                icon={faXmark}
                                className="text-white"
                              />
                            )}
                            {status === null && "Set price"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 w-3/4">
                <span className="ml-2">{shoe.article} - Available sizes</span>
                <div
                  className={`mt-2 text-lg p-2 rounded-2xl flex flex-row flex-wrap flex-1 gap-1 max-h-[61px] max-w-fit overflow-clip ${
                    sizes.length === 0 ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  {sizes.length > 0 ? (
                    sizes.map((size) => (
                      <span
                        key={uuidv4()}
                        className="border border-gray-300 rounded-md w-8 text-gray-400 p-1 h-6 text-center text-xs bg-sneakers-first"
                      >
                        {size}
                      </span>
                    ))
                  ) : (
                    <span className="text-lg font-semibold">Sold out</span>
                  )}
                </div>
              </div>
            </div>
          </animated.li>
        );
      }

export default ShoeItem;
