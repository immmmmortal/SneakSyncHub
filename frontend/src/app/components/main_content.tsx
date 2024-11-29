"use client";

import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCheckCircle,
  faCircleInfo,
  faGear,
  faHouse,
  faMagnifyingGlass,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import ManageUserComponent from "@/app/components/manage_user_icon";
import Link from "next/link";
import { createTheme, ThemeProvider } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";

const MainContentComponent: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const [isFetchingPlan, setIsFetchingPlan] = useState(false);

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  useEffect(() => {
    if (isOpen) {
      setIsTransitioning(true);
    } else {
      const timer = setTimeout(() => setIsTransitioning(false), 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<
    "free" | "premium" | null
  >(null); // Adjusted to handle null during initial fetch

  const plans = [
    {
      name: "Free",
      price: "0",
      description:
        "Perfect for getting started with basic scraping. Gain access to" +
        " limited data points.",
      features: ["Basic scraping access", "Limited data points", "Ads"],
    },
    {
      name: "Premium",
      price: "19.99",
      description: "Unlock unlimited access to powerful scraping capabilities.",
      features: [
        "Unlimited scraping access",
        "Detailed product data",
        "No ads",
        "Priority support",
      ],
    },
  ];

  const handleOpenModal = async () => {
    setIsFetchingPlan(true); // Start loading
    setIsModalOpen(true);

    try {
      const response = await fetch(
        "https://localhost/api/update-subscription/",
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription); // Update subscription state
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch subscription:", errorData);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setIsFetchingPlan(false); // End loading
    }
  };

  const handleUpgradePlan = async (plan: "free" | "premium") => {
    try {
      const response = await fetch(
        "https://localhost/api/update-subscription/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ plan }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription); // Update subscription state
        setIsModalOpen(false); // Close modal after successful plan update

        toast.success("Subscription updated successfully!", {
          toastId: "upgrade-success-toast", // Unique ID for success
        });
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.detail}`, {
          toastId: "upgrade-error-toast", // Unique ID for error
        });
      }
    } catch (error) {
      console.error("Error upgrading plan:", error);
      toast.error("An error occurred while upgrading your plan.", {
        toastId: "upgrade-network-error-toast", // Unique ID for network error
      });
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="relative flex overflow-auto h-full w-full">
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`fixed will-change-transform top-0 left-0 h-full transition-transform duration-300 ease-in-out bg-sneakers-first z-50 flex flex-col text-gray-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ width: "16rem" }} // Fixed width for the sidebar
        >
          <ul className="[&_li]:p-4 mt-24 flex-grow flex flex-col gap-2 p-2 text-white">
            <Link href="/">
              <li className="hover:bg-sneakers-second hover:rounded-2xl">
                <FontAwesomeIcon icon={faHouse} className="mr-2" />
                SneakSyncHub
              </li>
            </Link>
            <Link
              href="/search"
              className="hover:bg-sneakers-second hover:rounded-2xl"
            >
              <li>
                <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
                Search
              </li>
            </Link>
            <li className="hover:bg-sneakers-second hover:rounded-2xl">
              <FontAwesomeIcon icon={faGear} className="mr-2" />
              Settings
            </li>
            <li className="hover:bg-sneakers-second hover:rounded-2xl">
              <FontAwesomeIcon icon={faCircleInfo} className="mr-2" />
              About
            </li>
          </ul>
          <footer className="p-4 ml-2 mr-2 mb-2 hover:bg-sneakers-second rounded-xl text-white">
            <div className="flex flex-row" onClick={handleOpenModal}>
              <FontAwesomeIcon
                icon={faWandMagicSparkles}
                className="mr-2 self-center"
              />
              <div className="flex flex-col items-start">
                <div className="flex items-start">Upgrade Plan</div>
                <div className="flex text-sm text-gray-500">
                  Get unique features
                </div>
              </div>
            </div>
          </footer>
        </div>

        {/* Main Content Area */}
        <div
          ref={contentRef}
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isOpen ? "ml-64" : "ml-0"
          }`}
        >
          <button
            ref={openButtonRef}
            className={`fixed top-3.5 left-3 p-2 text-white rounded z-50 transition-transform duration-300 ease-in-out`}
            onClick={() => setIsOpen((prev) => !prev)} // Toggle isOpen state
          >
            <FontAwesomeIcon icon={faBars} className="text-2xl" />
          </button>

          <div className="ml-14 h-full p-3.5">{children}</div>
        </div>
        <div className="fixed top-3.5 right-6">
          <ManageUserComponent
            sidebarRef={sidebarRef}
            openButtonRef={openButtonRef}
          />
        </div>
      </div>

      {/* Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-sneakers-first rounded-lg p-8 w-3/5 relative">
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl flex justify-center font-bold">
              Upgrade your plan
            </h2>
            <div className="flex justify-between gap-10 mt-10">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-4 border rounded-lg flex justify-items-start flex-col cursor-pointer w-1/2 ${
                    currentSubscription === plan.name.toLowerCase()
                      ? "bg-sneakers-second text-white"
                      : "hover:bg-sneakers-first"
                  }`}
                >
                  <h3 className="text-lg font-semibold">
                    {isFetchingPlan ? (
                      <span className="blur-sm">Loading...</span>
                    ) : (
                      <span className="text-xl">{plan.name}</span>
                    )}
                  </h3>
                  <p className="text-lg">
                    {isFetchingPlan ? (
                      <span className="blur-sm">Fetching...</span>
                    ) : (
                      <div className="flex flex-row">
                        <span className="absolute text-xl text-neutral-500">
                          $
                        </span>
                        <div className="flex flex-row items-center">
                          <span className="relative pl-3 text-4xl">
                            {plan.price}
                          </span>
                          <div className="flex text-sm pl-2 text-neutral-500 flex-col gap-0">
                            <span className="absolute">USD/</span>
                            <span className="mt-3">month</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </p>

                  <div className="mt-4">{plan.description}</div>

                  {/* Action button after price */}
                  {isFetchingPlan ? (
                    <button
                      className="mt-4 w-full bg-gray-400 py-3 rounded-3xl animate-pulse"
                      disabled
                    >
                      Loading...
                    </button>
                  ) : plan.name.toLowerCase() === currentSubscription ? (
                    <button
                      className="mt-4 w-full bg-gray-400 text-white py-3 rounded-3xl"
                      disabled
                    >
                      Your current plan
                    </button>
                  ) : (
                    <button
                      className={`mt-4 w-full hover:bg-green-800 py-3 rounded-3xl ${
                        plan.name === "Free"
                          ? "bg-gray-500 text-white"
                          : "bg-sneakers-button text-white"
                      }`}
                      onClick={() =>
                        handleUpgradePlan(
                          plan.name.toLowerCase() as "free" | "premium",
                        )
                      }
                    >
                      {plan.name === "Free"
                        ? "Downgrade"
                        : `Upgrade to ${plan.name}`}
                    </button>
                  )}

                  {/* Features block */}
                  <ul className="list-disc pl-5 mt-4 text-sm">
                    {isFetchingPlan ? (
                      <li className="blur-sm">Loading features...</li>
                    ) : (
                      plan.features.map((feature, idx) => (
                        <li key={idx} className="list-none py-1">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="pr-3"
                          />
                          {feature}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
};

export default MainContentComponent;
