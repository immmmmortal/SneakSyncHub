import React, { useState } from "react";
import Checkbox from "@mui/material/Checkbox"; // Checkbox import from Material UI

interface KeywordFilterSectionProps {
  header: string;
  keywords: string[];
  selectedKeywords: string[];
  onKeywordChange: (updatedKeywords: string[]) => void;
}

const KeywordFilterSection = ({
  header,
  keywords,
  selectedKeywords,
  onKeywordChange,
}: KeywordFilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(false); // Manage visibility of keywords

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleKeywordClick = (keyword: string) => {
    const updatedKeywords = selectedKeywords.includes(keyword)
      ? selectedKeywords.filter((k) => k !== keyword)
      : [...selectedKeywords, keyword];
    onKeywordChange(updatedKeywords);
  };

  return (
    <>
      <div className="mt-4 p-1">
        {/* Header */}
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={toggleOpen}
        >
          <h2 className="font-bold">{header}</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-5 h-5 transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Dropdown Content with Transition */}
        <div
          className={`mt-2 overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? "max-h-80 h-auto" : "max-h-0"
          }`}
        >
          <div className="flex flex-wrap">
            {/* Ensure each keyword is on a new line */}
            {keywords.map((keyword) => (
              <div
                key={keyword}
                className="flex items-center w-full cursor-pointer" // Ensures each keyword takes up 100% of the width
                onClick={() => handleKeywordClick(keyword)}
              >
                <Checkbox
                  checked={selectedKeywords.includes(keyword)}
                  onChange={() => handleKeywordClick(keyword)}
                  name={keyword}
                  color="default"
                />
                <span>{keyword}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Divider */}
      </div>
      <div className="border-b-2 mt-3 border-neutral-800"></div>
    </>
  );
};

export default KeywordFilterSection;
