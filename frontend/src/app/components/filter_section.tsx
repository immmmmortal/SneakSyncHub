import React, {useEffect, useState} from 'react';
import 'rc-slider/assets/index.css';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import {toast} from 'react-toastify';

function valuetext(value: number) {
    return `${value}°C`;
}

interface FilterSectionComponentProps {
    minPrice: number;
    maxPrice: number;
    onDataFetched: (data: any) => void;
}

const FilterSectionComponent = ({
                                    minPrice,
                                    maxPrice,
                                    onDataFetched,
                                }: FilterSectionComponentProps) => {
    const [value, setValue] = useState<number[]>([minPrice, maxPrice]);
    const [pendingValue, setPendingValue] = useState<number[]>([minPrice, maxPrice]);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [hasInteracted, setHasInteracted] = useState<boolean>(false); // Track user interaction

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
                const url = `https://localhost:8000/api/search/shoes/?min_price=${value[0]}&max_price=${value[1]}`;
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
    }, [value, hasInteracted]);

    return (
        <div
            className="bg-sneakers-first h-full rounded-2xl min-w-48 p-3 max-w-52 w-52">
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
                                    className="flex"
                                    value={pendingValue[0]}
                                    onChange={(e) => handleInputChange(0, e)}
                                />
                            </div>
                            <div
                                className="flex flex-row gap-1 items-center [&_input]:w-12 [&_input]:rounded">
                                <span>to</span>
                                <input
                                    className="flex"
                                    value={pendingValue[1]}
                                    onChange={(e) => handleInputChange(1, e)}
                                />$
                            </div>
                        </div>
                        <div className="pr-2 pl-2">
                            <Slider
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
            </div>
        </div>
    );
};

export default FilterSectionComponent;
