import React, {useEffect, useState} from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Image from "next/image";
import Link from "next/link";
import {useAuth} from "@/app/lib/auth";

// Define responsive breakpoints for the carousel
const responsive = {
    superLargeDesktop: {
        breakpoint: {max: 4000, min: 1024},
        items: 3,
    },
    desktop: {
        breakpoint: {max: 1024, min: 768},
        items: 3,
    },
    tablet: {
        breakpoint: {max: 768, min: 464},
        items: 3,
    },
    mobile: {
        breakpoint: {max: 464, min: 0},
        items: 2,
    },
};

// Component to display the carousel of popular shoes
const PopularShoesCarousel = () => {
    const [popularShoes, setPopularShoes] = useState<any[]>([]);
    const {isAuthenticated} = useAuth();

    useEffect(() => {
        // Fetch popular shoes from the backend using fetch and including credentials
        const fetchPopularShoes = async () => {
            try {
                const response = await fetch("https://localhost:8000/api/trending_shoes", {
                    method: "GET",
                    credentials: "include", // Include cookies or credentials in the request
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    console.log(response.json());
                    throw new Error("Error fetching popular shoes");
                }

                const data = await response.json();
                setPopularShoes(data);
            } catch (error) {
                console.error("Error fetching popular shoes", error);
            }
        };

        fetchPopularShoes();
    }, []);

    return (
        <Carousel
            responsive={responsive}
            containerClass="carousel-container"
            itemClass="px-4" // Add horizontal padding to each item for spacing
        >
            {popularShoes.map((shoe) => (
                <div key={shoe.article}
                     className="shoe-item h-full bg-sneakers-first rounded-2xl shadow-lg flex flex-col items-center gap-2">
                    <div className="w-full">
                        <div
                            className="absolute z-10 bg-sneakers-first min-w-8 p-1 rounded-xl opacity-60 text-green-300 top-2 right-6">{shoe.price}$
                        </div>
                        <Image
                            src={shoe.image_url}
                            width="230"
                            height="230"
                            alt={shoe.name}
                            className="w-full relative rounded-t-2xl"
                        />
                    </div>
                    <h3 className="shoe-name hover:text-orange-500 transition-all p-3 text-lg font-bold">
                        {isAuthenticated ? <Link
                                href={`/shoes/${shoe.article}`}>{shoe.name}</Link> :
                            <>
                                {shoe.name}
                            </>
                        }

                    </h3>
                </div>
            ))}
        </Carousel>
    );
};

// Export the PopularShoesCarousel component
export default PopularShoesCarousel;
