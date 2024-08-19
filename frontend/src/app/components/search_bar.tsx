import React, {useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons";

interface SearchBarProps {
    width: string;
    article_loading: boolean;
    placeholder: string;
    onSearch: (searchQuery: string) => void; // Add onSearch prop
}

const SearchBarComponent = ({
                                article_loading,
                                width,
                                placeholder,
                                onSearch
                            }: SearchBarProps) => {
    const [search, setSearch] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const handleSearch = async () => {
        if (search.trim() === "") {
            setError("Search field cannot be empty.");
            return; // Do nothing if the input is empty
        }

        setError(null); // Clear previous errors
        setLoading(true); // Start loading state

        try {
            onSearch(search); // Call the onSearch prop
        } catch (error) {
            setError("An error occurred while fetching the data. Please try again.");
        } finally {
            setLoading(false); // End loading state
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const selectAllText = () => {
        if (inputRef.current) {
            inputRef.current.select();
        }
    };


    return (
        <div className="flex flex-col items-start">
            <div className="flex flex-row items-center justify-stretch mb-2">
                <input
                    ref={inputRef}
                    className={`placeholder:text-gray-400 bg-sneakers-second p-2 focus:outline-none text-white h-12 w-[${width}px]`}
                    placeholder={placeholder}
                    style={{
                        borderBottom: isFocused ? `2px solid #fff` : '1px solid #fff',
                        width: `${width}px`
                    }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => {
                        setIsFocused(true);
                        selectAllText(); // Select all text when the input gains focus
                    }}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown} // Handle Enter key press
                />
                <div
                    className="self-stretch p-2 content-center bg-sneakers-second cursor-pointer"
                    style={{borderBottom: isFocused ? '2px solid #fff' : '1px solid #fff'}}
                    onClick={handleSearch} // Handle click on the icon
                >
                    {loading || article_loading ? (
                        <div
                            className="w-4 h-4 border-4 border-t-4 border-t-white border-transparent rounded-full animate-spin"></div>
                    ) : (
                        <FontAwesomeIcon
                            className="focus:outline-none text-gray-400 text-xl"
                            icon={faMagnifyingGlass}
                        />
                    )}
                </div>
            </div>
            {error && (
                <div className="text-red-500 text-sm mb-2">
                    {error}
                </div>
            )}
        </div>
    );
};

export default SearchBarComponent;
