import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { toast } from "react-toastify";
import { Shoe } from "../interfaces/interfaces";
import Image from "next/image";
import Checkbox from "@mui/material/Checkbox";
import { Tooltip } from "react-tooltip";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FcCheckmark } from "react-icons/fc";
import { VscError } from "react-icons/vsc";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  shoes: Shoe[];
}

interface SelectedShoe {
  error: boolean;
  shoe: Shoe;
  isLoading: boolean;
  isSuccess: boolean;
  rescraped?: boolean;
}

export const RescrapeModalComponent: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  shoes,
}) => {
  const [selectedShoesState, setSelectedShoesState] = useState<
    Record<string, SelectedShoe>
  >({});

  const [selectedShoes, setSelectedShoes] = useState<Shoe[]>([]); // Change to store full Shoe object
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

      // Inside the useEffect where you're handling the WebSocket message:
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("Received message:", message);

        const article: string = message.article;

        // Check if the article is one of the selected shoes
        setSelectedShoesState((prevState) => {
          const updatedState = { ...prevState };

          const shoeIndex = selectedShoes.findIndex(
            (shoe) => shoe.article === article,
          );

          if (shoeIndex >= 0) {
            if (message.status === "error") {
              updatedState[article] = {
                ...updatedState[article],
                isLoading: false,
                isSuccess: false,
                error: true,
              };

              setScrapeResults((prevResults) => ({
                ...prevResults,
                [article]: { error: message.error },
              }));

              // Prevent duplicate error toasts
              const toastId = `error-${article}`;
              if (!toast.isActive(toastId)) {
                toast.error(`Error scraping article ${article}`, {
                  toastId, // Assign a unique ID for the toast
                });
              }
            } else if (message.status === "success") {
              updatedState[article] = {
                ...updatedState[article],
                isLoading: false,
                isSuccess: true,
              };

              setScrapeResults((prevResults) => ({
                ...prevResults,
                [article]: { data: message.data },
              }));
            }
          }

          return updatedState;
        });
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
  }, [isOpen, selectedShoes]);

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

    const updatedShoesState = { ...selectedShoesState };
    selectedShoes.forEach((shoe) => {
      updatedShoesState[shoe.article] = {
        ...updatedShoesState[shoe.article],
        isLoading: true,
        isSuccess: false, // Reset the success state
      };
    });
    setSelectedShoesState(updatedShoesState);

    const requestPayload = selectedShoes.map((shoe) => ({
      article: shoe.article,
      parse_from: shoe.parsed_from,
    }));

    if (requestPayload.length === 0) {
      toast.error("No valid shoes selected for scraping.");
      return;
    }

    console.log("Sending WebSocket payload:", requestPayload);
    webSocket.send(JSON.stringify(requestPayload));
    toast.info("Scraping request sent.");
  };

  const handleCheckboxChange = (shoe: Shoe) => {
    setSelectedShoes((prev) => {
      if (prev.find((s) => s.id === shoe.id)) {
        return prev.filter((s) => s.id !== shoe.id);
      } else {
        if (prev.length < maxSelectableShoes) {
          return [...prev, shoe];
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
    const latestShoes = shoes.slice(0, maxSelectableShoes);
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
          </div>

          <div className="p-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-sneakers-first scrollbar-rounded-md">
            {shoes.map((shoe) => {
              const shoeState = selectedShoesState[shoe.article];
              return (
                <div
                  key={shoe.id}
                  className="flex items-center mb-4 h-16 bg-sneakers-first"
                >
                  <div className="w-16 h-16 relative">
                    <Image
                      width="64"
                      height="64"
                      src={shoe.image}
                      alt={shoe.name}
                      className="object-cover w-full h-full rounded-l-lg"
                    />
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="flex w-full justify-between items-center">
                      <div className="flex flex-col ml-2">
                        <span className="h-2/3">{shoe.name}</span>
                        <span className="text-sm h-1/3 text-green-600">
                          ${shoe.price}
                        </span>
                      </div>
                      <div className="flex"></div>
                      {shoeState?.isLoading ? (
                        <div className="min-w-12 min-h-12 w-12 h-12 flex justify-center items-center">
                          <div className="min-w-6 min-h-6 w-6 h-6 border-4 border-t-4 border-gray-300 border-t-sneakers-button rounded-full animate-spin"></div>
                        </div> // Loading animation
                      ) : shoeState?.isSuccess ? (
                        <div className="min-w-12 min-h-12 w-12 h-12 flex justify-center items-center">
                          <FcCheckmark className="min-w-6 min-h-6 w-6 h-6" />
                        </div>
                      ) : shoeState?.error ? (
                        <>
                          <div className="min-w-12 min-h-12 w-12 h-12 flex justify-center items-center">
                            <VscError className="min-w-6 min-h-6 w-6 text-red-600 h-6" />
                          </div>
                        </>
                      ) : (
                        <div className="min-w-12 min-h-12 w-12 h-12 flex justify-center items-center">
                          <Checkbox
                            checked={selectedShoes.some(
                              (s) => s.id === shoe.id,
                            )}
                            onChange={() => handleCheckboxChange(shoe)}
                            className="mr-2 flex"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              className="bg-neutral-500 text-white px-4 py-2 rounded-md"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default RescrapeModalComponent;
