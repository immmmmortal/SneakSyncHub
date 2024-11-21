import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import "rc-slider/assets/index.css";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { toast } from "react-toastify";
import { useAuth } from "@/app/lib/auth";
import KeywordFilterSection from "./keyword_filter_section";

function valuetext(value: number) {
  return `${value}°C`;
}

interface FilterSectionComponentProps {
  minPrice: number;
  maxPrice: number;
  onDataFetched: (data: any) => void;
  setIsKeywordFiltered: Dispatch<SetStateAction<boolean>>;
}

const FilterSectionComponent = ({
  minPrice,
  maxPrice,
  onDataFetched,
  setIsKeywordFiltered,
}: FilterSectionComponentProps) => {
  const [value, setValue] = useState<number[]>([minPrice, maxPrice]);
  const [pendingValue, setPendingValue] = useState<number[]>([
    minPrice,
    maxPrice,
  ]);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false); // Track user interaction
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]); // Track selected keywords
  const { isAuthenticated } = useAuth();

  const handleChange = (event: Event, newValue: number | number[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    setPendingValue(newValue as number[]);
    setTimer(
      setTimeout(() => {
        setValue(newValue as number[]);
        setProgress(0);
        setHasInteracted(true); // Set interaction flag when user changes the slider
      }, 1000),
    );
  };

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = Number(event.target.value);
    if (isNaN(newValue)) return;

    if (index === 0 && newValue <= pendingValue[1]) {
      setPendingValue([newValue, pendingValue[1]]);
    } else if (index === 1 && newValue >= pendingValue[0]) {
      setPendingValue([pendingValue[0], newValue]);
    }

    if (timer) {
      clearTimeout(timer);
    }
    setTimer(
      setTimeout(() => {
        setValue([newValue, pendingValue[index === 0 ? 1 : 0]]);
        setProgress(0);
        setHasInteracted(true); // Set interaction flag when user changes the input
      }, 1000),
    );
  };

  const handleKeywordChange = (updatedKeywords: string[]) => {
    setSelectedKeywords(updatedKeywords); // Update the state directly with the updated keywords
    setIsKeywordFiltered(true);
    setHasInteracted(true); // Ensure interaction flag is set for requests
  };

  useEffect(() => {
    if (
      !isNaN(minPrice) &&
      !isNaN(maxPrice) &&
      minPrice !== Infinity &&
      maxPrice !== Infinity
    ) {
      setValue([minPrice, maxPrice]);
      setPendingValue([minPrice, maxPrice]);
    }
  }, [minPrice, maxPrice]);

  useEffect(() => {
    if (progress > 0 && progress < 100) {
      const progressTimer = setTimeout(() => setProgress(progress + 10), 100);
      return () => clearTimeout(progressTimer);
    }
  }, [progress]);

  useEffect(() => {
    if (hasInteracted) {
      const fetchShoes = async () => {
        // Build the query parameters based on the filters
        const params = new URLSearchParams();

        // Add price range to the query parameters
        params.append("min_price", value[0].toString());
        params.append("max_price", value[1].toString());

        // Add selected keywords as comma-separated values
        if (selectedKeywords.length > 0) {
          const keywordParam = selectedKeywords.join(",");
          params.append("keyword", keywordParam);
        }

        const url = `https://localhost:8000/api/search/shoes/?${params.toString()}`;

        try {
          const response = await fetch(url, {
            method: "GET",
            credentials: "include",
          });

          if (!response.ok) {
            toast.error(`HTTP error! status: ${response.status}`);
            return;
          }

          const data = await response.json();
          console.log("Fetched shoes data:", data);
          onDataFetched(data);
        } catch (error) {
          console.error("Failed to fetch shoes data:", error);
        }
      };

      fetchShoes();
    }
  }, [value, hasInteracted, selectedKeywords]);

  return (
    <div className="bg-sneakers-first h-full rounded-2xl min-w-48 p-3 max-w-52 w-56">
      <div>
        <input
          placeholder="Filter by params"
          className="placeholder:text-gray-400 placeholder:m bg-sneakers-second p-2 focus:outline-none text-white h-12 rounded-xl w-full"
        />
        <div className="p-1">
          <h2 className="mt-5 font-bold">Price</h2>
          <Box>
            <div className="text-white mt-2 flex justify-between [&_input]:p-2 [&_input]:bg-sneakers-second items-center gap-3 [&_span]:text-sm">
              <div className="flex flex-row gap-1 items-center [&_input]:w-12 [&_input]:rounded">
                <span>From</span>
                <input
                  disabled={!isAuthenticated}
                  className="flex"
                  value={pendingValue[0]}
                  onChange={(e) => handleInputChange(0, e)}
                />
              </div>
              <div className="flex flex-row gap-1 items-center [&_input]:w-12 [&_input]:rounded">
                <span>to</span>
                <input
                  disabled={!isAuthenticated}
                  className="flex"
                  value={pendingValue[1]}
                  onChange={(e) => handleInputChange(1, e)}
                />
                $
              </div>
            </div>
            <div className="pr-2 pl-2">
              <Slider
                disabled={!isAuthenticated}
                className="mt-1"
                sx={{ color: "darkgrey" }}
                min={minPrice}
                max={maxPrice}
                getAriaLabel={() => "Price range"}
                value={pendingValue}
                onChange={handleChange}
                onChangeCommitted={() => setProgress(10)}
                valueLabelDisplay="auto"
                getAriaValueText={valuetext}
              />
            </div>
          </Box>
        </div>
        <div
          className={`border-b-2 ${progress > 0 && "animate-pulse"} mt-5 border-neutral-800`}
        ></div>
        <div className="">
          <div className="mt-2">
            <KeywordFilterSection
              header="Material"
              keywords={[
                "Leather",
                "Synthetic Leather",
                "Suede",
                "Textiles",
                "Plastic",
                "GORE-TEX",
                "Rubber",
              ]}
              selectedKeywords={selectedKeywords}
              onKeywordChange={(updatedKeywords) =>
                handleKeywordChange(updatedKeywords)
              }
            />

            <KeywordFilterSection
              header="Design & Aesthetics"
              keywords={[
                "Low-Profile Design",
                "Serrated 3-Stripes",
                "T-toe",
                "Gum Sole",
                "Iconic Form",
              ]}
              selectedKeywords={selectedKeywords}
              onKeywordChange={(updatedKeywords) =>
                handleKeywordChange(updatedKeywords)
              }
            />

            <KeywordFilterSection
              header="Comfort & Performance"
              keywords={[
                "Breathable",
                "Durable",
                "Lightweight",
                "Waterproof",
                "Ankle-Height Cuff",
                "Gusseted Tongue",
                "Grippy Rubber Outsole",
              ]}
              selectedKeywords={selectedKeywords}
              onKeywordChange={(updatedKeywords) =>
                handleKeywordChange(updatedKeywords)
              }
            />

            <KeywordFilterSection
              header="Features"
              keywords={[
                "Water-Repellent",
                "Reinforced Toe",
                "Technical Design",
                "Multi-Sport Design",
                "Outdoor/Indoor Use",
              ]}
              selectedKeywords={selectedKeywords}
              onKeywordChange={(updatedKeywords) =>
                handleKeywordChange(updatedKeywords)
              }
            />

            <KeywordFilterSection
              header="Brand & Heritage"
              keywords={[
                "Samba Legacy",
                "Adidas Icon",
                "Zoom Vomero 5 Legacy",
                "Indoor Soccer Training",
              ]}
              selectedKeywords={selectedKeywords}
              onKeywordChange={(updatedKeywords) =>
                handleKeywordChange(updatedKeywords)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSectionComponent;
