import React, {useEffect, useRef, useState} from "react";
import {DesiredPrice, Shoe} from "@/app/interfaces/interfaces";
import {useOverflowDetector} from "react-detectable-overflow";
import {Tooltip} from "react-tooltip";
import {useTransition} from "@react-spring/web";
import ShoeItem from "./shoe_item";

interface ArticleInfoComponentProps {
  shoes: Shoe[];
  handleDelete: (id: number) => Promise<void>;
  desiredPrices: DesiredPrice[];
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
  desiredPrices,
}: ArticleInfoComponentProps) => {
  const { ref, overflow } = useOverflowDetector();
  const [menuOpen, setMenuOpen] = useState<number | null>(null); // Tracks which shoe's menu is open
  const menuRef = useRef<HTMLDivElement | null>(null); // Ref for menu to detect outside clicks

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
      {transitions((style, shoe) => (
        <ShoeItem
          key={shoe.id}
          style={style}
          shoe={shoe}
          handleDelete={handleDelete}
          desiredPrices={desiredPrices}
        />
      ))}
    </ul>
  );
};

export default ArticleInfoComponent;
