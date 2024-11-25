"use client";

import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
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
    "free" | "premium"
  >("free");

  const plans = [
    {
      name: "Free",
      price: "0$",
      features: ["Basic scraping access", "Limited data points", "Ads"],
    },
    {
      name: "Premium",
      price: "19.99$/month",
      features: [
        "Unlimited scraping access",
        "Detailed product data",
        "No ads",
        "Priority support",
      ],
    },
  ];

  const handleUpgradePlan = async (plan: "free" | "premium") => {
    try {
      const response = await fetch(
        "https://localhost:8000/api/update-subscription/",
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

        // Adding toastId to avoid duplicate toasts
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
          className={`fixed will-change-transform top-0 left-0 h-full transition-transform duration-300 ease-in-out bg-sneakers-first z-50 flex flex-col text-gray-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
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
            <div className="flex flex-row" onClick={() => setIsModalOpen(true)}>
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
          className={`flex-1 transition-all duration-300 ease-in-out ${isOpen ? "ml-64" : "ml-0"}`}
        >
          {/* Button for opening sidebar */}
          <button
            ref={openButtonRef}
            className={`fixed top-3.5 left-3 p-2 text-white rounded z-50 transition-transform duration-300 ease-in-out`}
            onClick={() => setIsOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} className="text-2xl" />
          </button>

          {/* Button for closing sidebar */}
          <button
            ref={openButtonRef}
            className={`fixed top-3.5 left-3 p-2 text-white rounded z-50 transition-transform duration-300 ease-in-out ${isOpen ? "" : "hidden"}`}
            onClick={() => setIsOpen(false)}
          >
            <FontAwesomeIcon icon={faBars} className="text-2xl" />
          </button>

          <div className="ml-14 h-full p-3.5">{children}</div>
        </div>
        {/* Manage User Component */}
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
          <div className="bg-sneakers-first rounded-lg p-8 w-3/5  relative">
            {/* Close Button in the Top Right */}
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>

            <h2 className="text-xl flex justify-center font-bold">
              Choose Your Plan
            </h2>
            <div className="flex justify-between gap-10 mt-10">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-4 border rounded-lg flex justify-between flex-col cursor-pointer w-1/2 ${currentSubscription === plan.name.toLowerCase() ? "bg-sneakers-second text-white" : "hover:bg-sneakers-first"}`}
                  onClick={() =>
                    handleUpgradePlan(
                      plan.name.toLowerCase() as "free" | "premium",
                    )
                  }
                >
                  <h3 className="text-lg font-semibold">{plan.name} Plan</h3>
                  <p className="text-sm">{plan.price}</p>
                  <ul className="list-disc pl-5 mt-4 text-sm">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>

                  {/* Buttons based on current subscription */}
                  {plan.name === "Free" && currentSubscription !== "free" && (
                    <button
                      className="mt-4 w-full bg-gray-500 text-white py-2 rounded-lg"
                      onClick={() => handleUpgradePlan("free")}
                    >
                      Downgrade to Free
                    </button>
                  )}
                  {plan.name === "Premium" &&
                    currentSubscription !== "premium" && (
                      <button
                        className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg"
                        onClick={() => handleUpgradePlan("premium")}
                      >
                        Upgrade to Premium
                      </button>
                    )}
                  {plan.name === "Free" && currentSubscription === "free" && (
                    <button
                      className="mt-4 w-full bg-gray-400 text-white py-2 rounded-lg"
                      disabled
                    >
                      It's your current plan
                    </button>
                  )}
                  {plan.name === "Premium" &&
                    currentSubscription === "premium" && (
                      <button
                        className="mt-4 w-full bg-gray-400 text-white py-2 rounded-lg"
                        disabled
                      >
                        It's your current plan
                      </button>
                    )}
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
