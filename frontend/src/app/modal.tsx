"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md"; // Add import for close icon
import { Tooltip } from "react-tooltip"; // Assuming you have a Tooltip component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const TelegramModal: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check the query parameter to control modal visibility
  useEffect(() => {
    const telegramModal = searchParams.get("telegramModal");
    setIsOpen(telegramModal === "true");
  }, [searchParams]);

  // Handle close modal by updating the query param
  const closeModal = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("telegramModal", "false");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    setStatus("idle");
    setErrorMessage(null);
  };

  // Handle sending Telegram username
  const handleSendTelegramUsername = async () => {
    if (!code.trim()) {
      setErrorMessage("Please enter the code from the bot.");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("https://localhost/api/verify_telegram_code/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        const errorData = await response.json();
        setErrorMessage(errorData.error || "An unknown error occurred.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Failed to connect to the server. Please try again.");
    }
  };

  // Return null if the modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-sneakers-first rounded-lg p-6 w-3/5 shadow-lg relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Link Telegram</h2>
          <button onClick={closeModal}>
            <MdClose className="text-2xl hover:text-neutral-500" />
          </button>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            id="telegram"
            value={code}
            onChange={handleInputChange}
            className="px-3 w-2/3 py-2 bg-sneakers-first
             border-b-2 focus:outline-none autofill:shadow-none autofill:bg-inherit
              autofill:text-inherit"
            placeholder="Insert code"
          />
          {errorMessage && status === "error" && (
            <Tooltip id="error-message-tooltip" defaultIsOpen={true} />
          )}
          <button
            onClick={handleSendTelegramUsername}
            className="pr-2 flex items-center border-b-2 py-3"
            disabled={status === "loading"} // Prevent double clicks
            data-tip={errorMessage} // Show error tooltip
            data-place="top" // Position of the tooltip
          >
            {status === "loading" ? (
              <div className="loader w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
            ) : status === "success" ? (
              <FontAwesomeIcon icon={faCheck} className="text-green-500" />
            ) : status === "error" ? (
              <FontAwesomeIcon
                icon={faXmark}
                data-tooltip-id="error-message-tooltip"
                data-tooltip-content={errorMessage || "Error"}
                className="text-red-500"
              />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} className="border-neutral-400" />
            )}
          </button>
        </div>
        <p className="text-neutral-50 mt-4">
          Visit our Telegram bot{" "}
          <a
            href="https://t.me/sneaksynchubbot?start=start"
            target="_blank"
            className="text-blue-500 underline"
          >
            SneakSyncHubBot
          </a>
          , and type <strong>/start</strong>. <br /> The bot will send you a code. Enter the code below to link your account.
        </p>
      </div>
    </div>
  );
};

export default TelegramModal;
