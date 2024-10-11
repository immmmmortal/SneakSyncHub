import React, {useState} from 'react';
import {Chart} from 'react-google-charts';
import {MenuItem, Select, ThemeProvider, createTheme} from "@mui/material";

interface PriceHistoryEntry {
    price: number; // Prices are coming as strings from the backend
    date_recorded: string; // Dates come as strings from the backend
}

interface PriceTrendChartProps {
    priceHistory: PriceHistoryEntry[];
}

const PriceTrendChart = ({priceHistory}: PriceTrendChartProps) => {
    const [view, setView] = useState<'daily' | 'weekly'>('daily'); // State for view selection

    // Function to aggregate data weekly
    const aggregateWeeklyData = (data: PriceHistoryEntry[]) => {
        const weeklyData: {
            [key: string]: { total: number; count: number }
        } = {};

        data.forEach((entry) => {
            const date = new Date(entry.date_recorded);
            const weekStart = new Date(date.setDate(date.getDate() - date.getDay())); // Get the start of the week (Sunday)
            const weekKey = weekStart.toISOString().split('T')[0]; // Use the date as the key in YYYY-MM-DD format

            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = {total: 0, count: 0};
            }
            weeklyData[weekKey].total += parseFloat(String(entry.price)); // Add price to the total
            weeklyData[weekKey].count += 1; // Increment count
        });

        return Object.entries(weeklyData).map(([date, {total, count}]) => [
            new Date(date), // Ensure date is a Date object
            (total / count).toFixed(2), // Calculate average price for the week
        ] as [Date, string]); // Explicitly define the return type
    };

    // Prepare the data for the Google Chart based on the selected view
    const chartData = [
        ['Date', 'Price', {
            role: 'tooltip',
            type: 'string',
            p: {html: true}
        }], // Chart headers
        ...(view === 'daily'
            ? priceHistory.map((entry) => {
                const date = new Date(entry.date_recorded);
                return [
                    date,
                    parseFloat(String(entry.price)),
                    `<div style="background-color: black; color: white; padding: 5px; border-radius: 5px;">
                        <strong>${date.toLocaleDateString()}</strong><br/>
                        Price: $${parseFloat(String(entry.price)).toFixed(2)}
                    </div>`, // Custom tooltip with styling
                ]; // Tooltip with date and price
            })
            : aggregateWeeklyData(priceHistory).map(([date, avgPrice]) => [
                date,
                parseFloat(avgPrice),
                `<div style="background-color: black; color: white; padding: 5px; border-radius: 5px;">
                    <strong>Week of ${date.toLocaleDateString()}</strong><br/>
                    Avg Price: $${parseFloat(avgPrice).toFixed(2)}
                </div>`, // Custom tooltip for weekly average
            ] as [Date, number, string])) // Explicitly define the return type
    ];

    const options = {
        title: 'Price Trend',
        titleTextStyle: {color: 'white'}, // Set title color to white
        hAxis: {
            title: 'Date',
            format: view === 'daily' ? 'MMM d, yyyy' : 'MMM d', // Format based on view
            gridlines: {color: '#888'}, // Gray grid lines
            textStyle: {color: 'white'}, // Set axis label color to white
            titleTextStyle: {color: 'white'}, // Set hAxis title color to white
        },
        vAxis: {
            title: 'Price',
            gridlines: {color: '#888'}, // Gray grid lines
            textStyle: {color: 'white'}, // Set axis label color to white
            titleTextStyle: {color: 'white'}, // Set vAxis title color to white
        },
        legend: 'none',
        curveType: 'function', // Smooth out the line
        backgroundColor: {
            fill: 'rgb(17, 19, 19)',
            stroke: 'none',
            strokeWidth: 0
        }, // Set background
        tooltip: {isHtml: true, textStyle: {color: 'white'}}, // Set tooltip text color to white
    };

    // Create a dark theme
    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });

    return (
        <ThemeProvider theme={darkTheme}>
            <div className="w-full">
                <div className="flex justify-between mt-4 pl-24">
                    <Select
                        value={view}
                        onChange={(event) => setView(event.target.value as 'daily' | 'weekly')}
                        variant="outlined"
                        sx={{
                            width: 150,
                            backgroundColor: 'rgb(25, 27, 28)', // Set background color for the button
                            "& .MuiSelect-select": {
                                color: 'white',
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgb(25, 27, 28)",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgb(25, 27, 28)",
                            },
                            "& .MuiSvgIcon-root": {
                                color: "white",
                            },
                            "&:hover": {
                                backgroundColor: 'rgb(30, 30, 30)', // Optional: Change background color on hover
                            },
                        }} // Adjust the style of the dropdown
                    >
                        <MenuItem value="daily">Daily View</MenuItem>
                        <MenuItem value="weekly">Weekly View</MenuItem>
                    </Select>

                </div>
                <Chart
                    chartType="LineChart"
                    width="100%"
                    height="400px"
                    data={chartData}
                    options={options}
                />
            </div>
        </ThemeProvider>
    );
};

export default PriceTrendChart;
