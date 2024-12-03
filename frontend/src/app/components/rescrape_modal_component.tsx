import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { toast } from "react-toastify";
import { Shoe } from "../interfaces/interfaces";
import Image from "next/image";
import Checkbox from "@mui/material/Checkbox";
import { Tooltip } from "react-tooltip";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BiDotsHorizontalRounded } from "react-icons/bi";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  shoes: Shoe[];
}

type ScrapingRequest = {
  article: string;
  parse_from: string;
};

export const RescrapeModalComponent: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  shoes,
}) => {
  const [selectedShoes, setSelectedShoes] = useState<number[]>([]);
  const [maxSelectableShoes, setMaxSelectableShoes] = useState<number>(5); // Default for free plan
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("free"); // Default plan is 'free'
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false); // Dropdown state
  const [scrapeResults, setScrapeResults] = useState<Record<string, any>>({});
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (isOpen) {
      const ws = new WebSocket("ws://localhost/ws/scrape/");

      ws.onopen = () => {
        console.log("WebSocket connection established");
        setWebSocket(ws);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("Received message:", message);

        // Handle scraping results
        if (message.error) {
          setScrapeResults((prevResults) => ({
            ...prevResults,
            [message.article]: { error: message.error },
          }));
          toast.error(
            `Error scraping article`,
          ); // Display error toast
        } else {
          setScrapeResults((prevResults) => ({
            ...prevResults,
            [message.article]: { data: message.data },
          }));
          toast.success(`Successfully scraped article ${message.article}`); // Display success toast
        }
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setWebSocket(null);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast.error("WebSocket connection error");
      };

      return () => {
        if (ws.readyState !== WebSocket.CLOSED) {
          console.log("Closing WebSocket connection...");
          ws.close();
        }
      };
    }
  }, [isOpen]);

  // Fetch the subscription plan when the modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchSubscriptionPlan = async () => {
        try {
          const response = await fetch(
            "https://localhost/api/update-subscription/",
            {
              method: "GET",
              credentials: "include",
            },
          );

          if (!response.ok) {
            throw new Error("Failed to fetch subscription plan");
          }

          const data = await response.json();
          if (data && data.subscription) {
            setSubscriptionPlan(data.subscription); // Set the subscription plan
            // Set maxSelectableShoes based on the subscription plan
            setMaxSelectableShoes(data.subscription === "premium" ? 10 : 5);
          } else {
            throw new Error("Subscription data not found");
          }
        } catch (error) {
          toast.error("Failed to load subscription plan");
        }
      };

      fetchSubscriptionPlan();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
      toast.error("WebSocket is not ready. Please try again.");
      return;
    }

    // Create an array to hold the scraping requests
    const requestPayload = selectedShoes
      .map((shoeId) => {
        const shoe = shoes.find((s) => s.id === shoeId);
        if (shoe) {
          const article = shoe.article;
          const parse_from = shoe.parsed_from;

          if (!article || !parse_from) {
            toast.error(`Missing required fields for shoe article: ${article}`);
            return null; // Skip this shoe if required data is missing
          }

          // Return the formatted object matching the fetch payload format
          return { article, parse_from };
        }
        return null; // Skip if the shoe is not found
      })
      .filter((item) => item !== null); // Remove any null values if data is missing

    if (requestPayload.length === 0) {
      toast.error("No valid shoes selected for scraping.");
      return;
    }

    console.log("Sending WebSocket payload:", requestPayload); // Debugging payload
    // Send the payload in the required format
    webSocket.send(JSON.stringify(requestPayload));

    toast.info("Scraping request sent.");
  };

  const handleCheckboxChange = (shoeId: number) => {
    setSelectedShoes((prev) => {
      if (prev.includes(shoeId)) {
        return prev.filter((id) => id !== shoeId);
      } else {
        if (prev.length < maxSelectableShoes) {
          return [...prev, shoeId];
        }
        return prev;
      }
    });
  };

  const handleReset = () => {
    setSelectedShoes([]);
  };

  // Select the latest shoes based on the subscription plan
  const handleSelectLatest = () => {
    const latestShoes = shoes
      .slice(0, maxSelectableShoes)
      .map((shoe) => shoe.id);
    setSelectedShoes(latestShoes);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleOutsideClick = () => {
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("click", handleOutsideClick);
      return () => document.removeEventListener("click", handleOutsideClick);
    }
  }, [isDropdownOpen]);

  return (
    isOpen && (
      <div className="fixed z-10 top-0 left-0 z-100 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-sneakers-second p-6 rounded-md overflow-hidden w-3/5 relative">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Select shoes to re-scrape</h3>
            <button onClick={onClose}>
              <MdClose className="text-xl" />
            </button>
          </div>

          <div className="pt-4 pb-4 relative">
            <div className="">
              <div className="flex flex-row justify-between">
                <div className="flex">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent closing on button click
                      toggleDropdown();
                    }}
                    className="focus:outline-none"
                  >
                    <BiDotsHorizontalRounded className="text-neutral-500 cursor-pointer text-xl" />
                  </button>
                </div>
                <div className="flex">
                  <Tooltip id="re-scrape-limit-info" className="z-10" />
                  <p className="ml-2 text-sm text-neutral-500">
                    {selectedShoes.length}/{maxSelectableShoes}
                  </p>
                  <span
                    data-tooltip-id="re-scrape-limit-info"
                    data-tooltip-content={`Amount of re-scrapes depends on subscription plan. Your current subscription is: ${subscriptionPlan}`}
                    className="ml-2 text-gray-500 cursor-pointer"
                  >
                    <AiOutlineInfoCircle className="text-neutral-500 cursor-pointer" />
                  </span>
                </div>
              </div>
              {/* Three dots for dropdown */}
              <div className="relative ml-4">
                {isDropdownOpen && (
                  <div className="absolute top-[-50px] left-0 bg-sneakers-first shadow-md rounded-md w-40 z-10">
                    <ul>
                      <li
                        className="px-4 py-2 hover:bg-sneakers-second cursor-pointer"
                        onClick={() => {
                          handleSelectLatest();
                          toggleDropdown();
                        }}
                      >
                        Select Latest
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-sneakers-second cursor-pointer"
                        onClick={() => {
                          // Placeholder for Select Favourite
                          toggleDropdown();
                        }}
                      >
                        Select Favourite
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-sneakers-first scrollbar-rounded-md">
            {shoes.map((shoe) => (
              <div
                key={shoe.id}
                className="flex items-center rounded-lg bg-sneakers-first mb-4"
              >
                <div className="flex flex-row w-full justify-between items-center">
                  <div className="flex flex-row">
                    {/* Container to force 1:1 aspect ratio */}
                    <div className="w-16 h-16 relative">
                      <Image
                        width="64"
                        height="64"
                        src={shoe.image}
                        alt={shoe.name}
                        className="object-cover w-full h-full rounded-l-lg"
                      />
                    </div>
                    {/* Break long colorway names into multiple lines */}
                    <label
                      htmlFor={`shoe-${shoe.id}`}
                      className="ml-2 w-3/5 break-words h-16 overflow-ellipsis overflow-hidden"
                    >
                      {shoe.name}
                    </label>
                  </div>
                  <Checkbox
                    className="min-w-12 min-h-12 w-12 h-12"
                    id={`shoe-${shoe.id}`}
                    checked={selectedShoes.includes(shoe.id)}
                    onChange={() => handleCheckboxChange(shoe.id)}
                    disabled={
                      selectedShoes.length >= maxSelectableShoes &&
                      !selectedShoes.includes(shoe.id)
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Scraping Status and Results */}
          <div>
            <h4 className="mt-4">Scrape Results:</h4>
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-sneakers-first scrollbar-rounded-md">
              {Object.entries(scrapeResults).map(([article, result]) => (
                <div key={article} className="mb-4">
                  <p className="font-bold">Article: {article}</p>
                  {result.error ? (
                    <p className="text-red-500">Error: {result.error}</p>
                  ) : (
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sticky submit button */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handleReset}
              className="mt-4 bg-neutral-800 hover:cursor-pointer justify-center text-white w-1/6 py-2 rounded-md flex"
              disabled={selectedShoes.length === 0}
            >
              <div className="flex items-center">Reset</div>
            </button>
            <button
              className="mt-4 bg-sneakers-button hover:cursor-pointer justify-center text-white w-1/6 py-2 rounded-md flex"
              disabled={selectedShoes.length === 0}
              onClick={handleSubmit}
            >
              <div className="flex items-center">Submit</div>
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default RescrapeModalComponent;
