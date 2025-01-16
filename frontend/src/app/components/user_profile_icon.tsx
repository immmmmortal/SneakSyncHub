'use client'

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import defaultUserProfileIcon from "../static/images/default_profile_picture.jpg";
import LogoutButtonComponent from "@/app/components/logout_button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrush,
  faCheck,
  faGear,
  faLink,
  faPaperPlane,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { ClickOutsideRefInterface } from "@/app/interfaces/interfaces";
import { MdClose } from "react-icons/md";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import {router} from "next/client";

const Modal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [telegramUsername, setTelegramUsername] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

  const openTelegramModal = () => {
    setIsTelegramModalOpen(true);
  };

  const closeTelegramModal = () => {
    setIsTelegramModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelegramUsername(e.target.value);
    setStatus("idle"); // Reset status when input changes
    setErrorMessage(null); // Clear any previous errors
  };

  const handleSendTelegramUsername = async () => {
    if (!telegramUsername.trim()) {
      setErrorMessage("Please enter your Telegram username.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null); // Reset errors during loading

    try {
      const response = await fetch("https://localhost/api/link_telegram/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ telegram_username: telegramUsername }),
      });

      if (response.ok) {
        setStatus("success");
        const data = await response.json();
        console.log("Response:", data);
      } else {
        setStatus("error");
        const errorData = await response.json();
        setErrorMessage(errorData.error || "An unknown error occurred.");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage("Failed to connect to the server. Please try again.");
      console.error("Error linking Telegram account:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-99">
      <div className="bg-sneakers-first rounded-lg p-6 w-3/5 shadow-lg relative">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold">Settings</h2>
          <button onClick={onClose}>
            <MdClose className="text-xl hover:text-neutral-500" />
          </button>
        </div>

        <div className="flex flex-row gap-12">
          <div className="flex w-2/5">
            <ul className="flex flex-col gap-4">
              <li className="flex flex-row items-center gap-2">
                <FontAwesomeIcon icon={faGear} className="flex" />
                <div className="flex">General</div>
              </li>
              <li className="flex flex-row items-center gap-2">
                <FontAwesomeIcon icon={faLink} className="flex text-sm" />
                <div className="flex">Connected Apps</div>
              </li>
            </ul>
          </div>
          <div className="flex w-full items-start">
            <div className="flex flex-row items-center">
              <div className="flex flex-row gap-8">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-2">
                    <div>
                      <FontAwesomeIcon
                        icon={faPaperPlane}
                        className="text-blue-500 text-xl"
                      />
                    </div>
                    <div>
                      <h2>Telegram</h2>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-neutral-400 text-sm">
                      Link your telegram to receive news, sales info about
                      shoes.
                    </h1>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(
                        window.location.search,
                      );
                      params.set("telegramModal", "true");
                      router.push(`?${params.toString()}`);
                    }}
                    className="hover:bg-neutral-700 p-2 rounded-2xl font-medium text-neutral-300"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserProfileIcon: React.FC<ClickOutsideRefInterface> = ({
  sidebarRef,
  openButtonRef,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userProfilePicRef = useRef<HTMLImageElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        (!sidebarRef.current ||
          !sidebarRef.current.contains(event.target as Node)) &&
        (!openButtonRef.current ||
          !openButtonRef.current.contains(event.target as Node)) &&
        (!userProfilePicRef.current ||
          !userProfilePicRef.current.contains(event.target as Node))
      ) {
        setIsDropdownOpen(false);
      }
    },
    [sidebarRef, openButtonRef],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleProfileClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    toggleDropdown();
  };

  const openSettingsModal = () => {
    setIsModalOpen(true);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative cursor-pointer">
      <Image
        ref={userProfilePicRef}
        onClick={handleProfileClick}
        className="w-10 h-auto rounded-full"
        src={defaultUserProfileIcon}
        alt="defaultImage"
      />
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute shadow-lg min-w-max w-72 rounded-xl mt-4 right-0 bg-sneakers-first"
        >
          <ul className="p-2 rounded-lg">
            <div className="[&_li]:p-3">
              <li className="hover:bg-sneakers-second hover:rounded-2xl w-full">
                <FontAwesomeIcon className="mr-3" icon={faUser} />
                My Sneakers
              </li>
              <li className="hover:bg-sneakers-second hover:rounded-2xl w-full">
                <FontAwesomeIcon className="mr-3" icon={faBrush} />
                Customize Hub
              </li>
              <li
                className="hover:bg-sneakers-second hover:rounded-2xl w-full cursor-pointer"
                onClick={openSettingsModal}
              >
                <FontAwesomeIcon className="mr-3" icon={faGear} />
                Settings
              </li>
            </div>
            <li className="hover:bg-sneakers-second hover:rounded-2xl w-full mt-3 p-3">
              <LogoutButtonComponent />
            </li>
          </ul>
        </div>
      )}
      {/* Render Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default UserProfileIcon;
