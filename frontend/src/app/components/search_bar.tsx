import React, {useRef, useState, useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons";
import {Tooltip} from 'react-tooltip';

interface SearchBarProps {
    width: string;
    is_article_loading: boolean;
    placeholder: string;
    onSearch: (searchQuery: string) => void;
    is_disabled: boolean;
    fetchSuggestions: () => Promise<{ article: string }[]>; // Add a prop to fetch suggestions
}

const SearchBarComponent = ({
                                is_article_loading,
                                width,
                                placeholder,
                                onSearch,
                                is_disabled,
                                fetchSuggestions // Function to fetch suggestions
                            }: SearchBarProps) => {
    const [search, setSearch] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<{
        article: string
    }[]>([]); // State to store suggestions
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false); // State for dropdown visibility

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null); // Ref for the whole component

    const handleSearch = async () => {
        if (search.trim() === "") {
            setError("Search field cannot be empty.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            onSearch(search); // Trigger the search
        } catch (error) {
            setError("An error occurred while fetching the data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
            setShowSuggestions(false); // Hide suggestions when searching
        }
    };

    const selectAllText = () => {
        if (inputRef.current) {
            inputRef.current.select();
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setSearch(suggestion); // Set the selected suggestion in the input
        setShowSuggestions(false); // Hide the dropdown
    };

    const fetchAndShowSuggestions = async () => {
        if (!showSuggestions) {
            try {
                const fetchedSuggestions = await fetchSuggestions(); // Fetch suggestions
                setSuggestions(fetchedSuggestions);
                setShowSuggestions(true); // Show the dropdown
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        }
    };

    // Handle clicks outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false); // Hide suggestions if clicked outside
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={containerRef}
             className="flex flex-col items-start mr-5 relative w-fit justify-center">
            {is_disabled && <Tooltip id="disabled-searchbar-tooltip"
                                     content="Login to start searching!"/>}
            <div
                data-tooltip-id="disabled-searchbar-tooltip"
                className="flex flex-row items-center justify-stretch mb-2"
            >

                <input
                    disabled={is_disabled}
                    ref={inputRef}
                    className={`placeholder:text-gray-400 bg-sneakers-second disabled:opacity-75 p-2 focus:outline-none text-white h-12 w-[${width}px]`}
                    placeholder={placeholder}
                    style={{
                        borderBottom: isFocused ? `2px solid #fff` : '1px solid #fff',
                        width: `${width}px`,
                    }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => {
                        setIsFocused(true);
                        selectAllText();
                        fetchAndShowSuggestions(); // Fetch suggestions when focusing
                    }}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                />
                <div
                    className={`self-stretch p-2 ${is_disabled ? undefined : 'cursor-pointer'} content-center bg-sneakers-second`}
                    style={{borderBottom: isFocused ? '2px solid #fff' : '1px solid #fff'}}
                    onClick={is_disabled ? undefined : handleSearch}
                >
                    {loading || is_article_loading ? (
                        <div
                            className="w-4 h-4 border-4 border-t-4 border-t-white border-transparent rounded-full animate-spin"></div>
                    ) : (
                        <FontAwesomeIcon
                            className="focus:outline-none text-gray-400 text-xl"
                            icon={faMagnifyingGlass}/>
                    )}
                </div>
            </div>
            {showSuggestions && suggestions.length > 0 && (
                <div
                    className="absolute top-14 w-full bg-sneakers-first text-white rounded-md shadow-lg z-50 max-h-48 overflow-auto [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className="px-4 py-2 hover:bg-sneakers-second cursor-pointer"
                            onClick={() => handleSuggestionClick(suggestion.article)}
                        >
                            {suggestion.article}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBarComponent;
