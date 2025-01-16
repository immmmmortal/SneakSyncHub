"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import defaultUserProfileIcon from "../static/images/default_profile_picture.jpg";
import LogoutButtonComponent from "@/app/components/logout_button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrush,
  faGear,
  faLink,
  faPaperPlane,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { ClickOutsideRefInterface } from "@/app/interfaces/interfaces";
import { MdClose } from "react-icons/md";
import "react-tooltip/dist/react-tooltip.css";
import { router } from "next/client";
import { useRouter } from "next/navigation";

const Modal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("https://localhost/api/profile", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setTelegramUsername(data.telegram_username || null);
      } else {
        console.error("Failed to fetch user profile.");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleUnpairTelegram = async () => {
    try {
      const response = await fetch("https://localhost/api/unlink_telegram", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setTelegramUsername(null);
        setStatus("success");
      } else {
        setStatus("error");
        const errorData = await response.json();
        setErrorMessage(
          errorData.error || "Failed to unpair Telegram account.",
        );
      }
    } catch (error) {
      console.error("Error unlinking Telegram account:", error);
      setErrorMessage("An unknown error occurred.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

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
            <div className="flex flex-row gap-8 justify-between w-full">
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
                    {telegramUsername ? (
                      <span>Your account is linked: @{telegramUsername}</span>
                    ) : (
                      <span>
                        Link your telegram to receive news, sales info about
                        shoes.
                      </span>
                    )}
                  </h1>
                </div>
              </div>
              <div className="flex items-center">
                {telegramUsername ? (
                  <button
                    onClick={handleUnpairTelegram}
                    className="hover:bg-red-500 p-2 rounded-2xl font-medium text-neutral-300"
                  >
                    Unpair
                  </button>
                ) : (
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
                )}
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
