import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import 'rc-slider/assets/index.css';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import {toast} from 'react-toastify';
import {useAuth} from "@/app/lib/auth";
import Checkbox from '@mui/material/Checkbox';
import {styled} from "@mui/system";

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
    const [pendingValue, setPendingValue] = useState<number[]>([minPrice, maxPrice]);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [hasInteracted, setHasInteracted] = useState<boolean>(false); // Track user interaction
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]); // Track selected keywords
    const {isAuthenticated} = useAuth();

    const keywords = ["durable", "styling", "breathable", "leather"]; // List of keywords for filtering

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
            }, 1000)
        );
    };

    const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
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
            }, 1000)
        );
    };

    const CustomCheckbox = styled(Checkbox)(({theme}) => ({
        color: "#111313",
        "&.MuiCheckbox-root": {
            "& .MuiSvgIcon-root": {
                backgroundColor: "#111313", // Default background when unchecked
                borderRadius: "4px",
            },
            "&.Mui-checked .MuiSvgIcon-root": {
                backgroundColor: "#111313", // Background when checked
            },
        },
    }));


    const handleKeywordChange = (keyword: string) => {
        if (selectedKeywords.includes(keyword)) {
            setSelectedKeywords(selectedKeywords.filter((kw) => kw !== keyword)); // Remove if already selected
        } else {
            setSelectedKeywords([...selectedKeywords, keyword]); // Add if not already selected
        }
        setIsKeywordFiltered(true)
        setHasInteracted(true); // Set interaction flag when user selects a keyword
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
                params.append('min_price', value[0].toString());
                params.append('max_price', value[1].toString());

                // Add selected keywords as comma-separated values
                if (selectedKeywords.length > 0) {
                    const keywordParam = selectedKeywords.join(',');
                    params.append('keyword', keywordParam);
                }

                const url = `https://localhost:8000/api/search/shoes/?${params.toString()}`;

                try {
                    const response = await fetch(url, {
                        method: 'GET',
                        credentials: 'include',
                    });

                    if (!response.ok) {
                        toast.error(`HTTP error! status: ${response.status}`);
                        return;
                    }

                    const data = await response.json();
                    console.log('Fetched shoes data:', data);
                    onDataFetched(data);
                } catch (error) {
                    console.error('Failed to fetch shoes data:', error);
                }
            };

            fetchShoes();
        }
    }, [value, hasInteracted, selectedKeywords]);

    return (
        <div
            className="bg-sneakers-first h-full rounded-2xl min-w-48 p-3 max-w-52 w-56">
            <div>
                <input
                    placeholder="Filter by params"
                    className="placeholder:text-gray-400 placeholder:m bg-sneakers-second p-2 focus:outline-none text-white h-12 rounded-xl w-full"
                />
                <div className="p-1">
                    <h2 className="mt-5 font-bold">Price</h2>
                    <Box>
                        <div
                            className="text-white mt-2 flex justify-between [&_input]:p-2 [&_input]:bg-sneakers-second items-center gap-3 [&_span]:text-sm">
                            <div
                                className="flex flex-row gap-1 items-center [&_input]:w-12 [&_input]:rounded">
                                <span>From</span>
                                <input
                                    disabled={!isAuthenticated}
                                    className="flex"
                                    value={pendingValue[0]}
                                    onChange={(e) => handleInputChange(0, e)}
                                />
                            </div>
                            <div
                                className="flex flex-row gap-1 items-center [&_input]:w-12 [&_input]:rounded">
                                <span>to</span>
                                <input
                                    disabled={!isAuthenticated}
                                    className="flex"
                                    value={pendingValue[1]}
                                    onChange={(e) => handleInputChange(1, e)}
                                />$
                            </div>
                        </div>
                        <div className="pr-2 pl-2">
                            <Slider
                                disabled={!isAuthenticated}
                                className="mt-1"
                                sx={{color: 'darkgrey'}}
                                min={minPrice}
                                max={maxPrice}
                                getAriaLabel={() => 'Price range'}
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
                    className={`border-b-2 ${progress > 0 && 'animate-pulse'} mt-5 border-neutral-800`}>
                </div>
                <div className="p-1">
                    <h2 className="mt-5 font-bold">Keywords</h2>
                    <div
                        className="mt-2">
                        {/* Use
                         grid layout with 2 columns */}
                        {keywords.map((keyword) => (
                            <div key={keyword}
                                 className="flex items-center"> {/* Center the checkbox and label */}
                                <label
                                    className="text-white flex items-center">
                                    <CustomCheckbox
                                        checked={selectedKeywords.includes(keyword)}
                                        onChange={() => handleKeywordChange(keyword)}
                                    />{keyword}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className={`border-b-2 ${progress > 0 && 'animate-pulse'} mt-5 border-neutral-800`}>
                </div>
            </div>
        </div>
    );
};

export default FilterSectionComponent;
