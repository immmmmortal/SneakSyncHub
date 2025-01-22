import React, { useEffect, useRef, useState } from "react";
import { Shoe } from "@/app/interfaces/interfaces";
import Link from "next/link";
import { useOverflowDetector } from "react-detectable-overflow";
import { Tooltip } from "react-tooltip";
import DeleteProductButtonComponent from "@/app/components/delete_product";
import Image from "next/image";
import { animated, useTransition } from "@react-spring/web";
import { calculateDiscount, NumericInput } from "../lib/utils";
import {
  faCheckCircle,
  faEllipsisVertical,
  faSpinner,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ArticleInfoComponentProps {
  shoes: Shoe[];
  handleDelete: (id: number) => Promise<void>;
}

// Helper to safely parse the `sizes` field into an array
const parseShoeSizes = (sizes: string): string[] => {
  try {
    // Replace single quotes with double quotes to make it valid JSON
    const sanitizedSizes = sizes.replace(/'/g, '"');
    // Parse the sanitized string as JSON
    const parsedSizes = JSON.parse(sanitizedSizes);
    // Ensure the result is an array
    return Array.isArray(parsedSizes) ? parsedSizes : [];
  } catch {
    // Return an empty array on error
    return [];
  }
};

const ArticleInfoComponent = ({
  shoes,
  handleDelete,
}: ArticleInfoComponentProps) => {
  const { ref, overflow } = useOverflowDetector();
  const [menuOpen, setMenuOpen] = useState<number | null>(null); // Tracks which shoe's menu is open
  const menuRef = useRef<HTMLDivElement | null>(null); // Ref for menu to detect outside clicks

  const { v4: uuidv4 } = require("uuid");
  const transitions = useTransition(shoes, {
    from: { opacity: 0, transform: "scale(0.95)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.95)" },
    keys: (shoe) => shoe.id,
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <ul className="flex-grow">
      <Tooltip id="delete-shoe-tooltip" className="z-10" />
      {overflow && <Tooltip className="z-20" id="shoe-name" />}
      {transitions((style, shoe) => {
        const sizes = parseShoeSizes(shoe.sizes);
        const [salePercentage, setSalePercentage] = useState("");
        const [salePrice, setSalePrice] = useState(
          shoe.sale_price ? shoe.sale_price : shoe.price,
        );
        const finalPrice =
          salePercentage && Number(shoe.price)
            ? (Number(shoe.price) * (100 - Number(salePercentage))) / 100
            : Number(shoe.price);
        const [status, setStatus] = useState<
          "loading" | "success" | "error" | null
        >(null);
        const [flatPrice, setFlatPrice] = useState("");

        const handleSetPrice = async () => {
          setStatus("loading"); // Set the button to loading state

          // Determine the desired price
          let desiredPrice: number | null = null;

          if (flatPrice && salePrice) {
            // Both flat price and sale price are available, compare them
            desiredPrice = Math.min(Number(flatPrice), Number(salePrice));
          } else if (flatPrice) {
            // Only flat price is available
            desiredPrice = Number(flatPrice);
          } else if (salePrice) {
            // Only sale price is available
            desiredPrice = Number(salePrice);
          }

          if (desiredPrice === null) {
            setStatus("error"); // If no price is set, show error
            return;
          }

          // Send request to the backend to set the price
          try {
            const response = await fetch(
              `https://localhost/api/create-preference/`,
              {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                  price: desiredPrice,
                  shoe_article: shoe.article,
                }),
              },
            );

            if (response.ok) {
              setStatus("success"); // Show success icon if status is 200
            } else {
              setStatus("error"); // Show error icon if response is not OK
            }
          } catch (error) {
            setStatus("error"); // Show error if there was an issue with the request
          }
        };

        return (
          <animated.li
            key={shoe.id}
            style={style}
            className={`item bg-sneakers-first max-h-48 h-48 rounded-2xl items-start flex flex-row mt-6 text-ellipsis overflow-hidden relative`}
          >
            <Link href={shoe.url} className="w-44 min-h-44 h-full">
              <Image
                width="192"
                height="192"
                src={shoe.image}
                alt={shoe.name}
                className="min-h-44 min-w-44 max-h-56 w-48 max-w-56 flex object-cover"
              />
            </Link>
            <div className="flex flex-col h-auto p-3 min-h-[224px] flex-grow ml-4">
              <div className="flex flex-row">
                <div
                  //@ts-ignore
                  ref={ref}
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
                    setMenuOpen((prev) => (prev === shoe.id ? null : shoe.id))
                  }
                />
                {menuOpen === shoe.id && (
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
                                icon={faCheckCircle}
                                className="text-green-500"
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
      })}
    </ul>
  );
};

export default ArticleInfoComponent;
