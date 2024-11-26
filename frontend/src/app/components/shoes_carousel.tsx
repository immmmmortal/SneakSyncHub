import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth";

// Define responsive breakpoints for the carousel
const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 1024 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 1024, min: 768 },
    items: 4,
  },
  tablet: {
    breakpoint: { max: 768, min: 464 },
    items: 3,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 2,
  },
};

// Component to display the carousel of popular shoes
const PopularShoesCarousel = () => {
  const [popularShoes, setPopularShoes] = useState<any[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Fetch popular shoes from the backend using fetch and including credentials
    const fetchPopularShoes = async () => {
      try {
        const response = await fetch(
          "https://localhost:8000/api/trending_shoes",
          {
            method: "GET",
            credentials: "include", // Include cookies or credentials in the request
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

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
        <div
          key={shoe.article}
          className="shoe-item h-full bg-sneakers-first rounded-2xl shadow-lg flex flex-col items-center"
        >
          <div className="w-full h-60 relative overflow-hidden rounded-t-2xl">
            {" "}
            {/* Fixed height container */}
            <div className="absolute z-10 bg-sneakers-first min-w-8 p-1 rounded-xl opacity-60 text-green-300 top-2 right-6">
              {shoe.price}$
            </div>
            <Image
              src={shoe.image_url}
              fill
              alt={shoe.name}
              className="object-cover" // Or use "object-contain" based on preference
            />
          </div>
          <h3 className="shoe-name hover:text-orange-500 transition-all p-3 text-lg font-bold text-left w-full">
            {isAuthenticated ? (
              <Link href={`/shoes/${shoe.article}`} className="block whitespace-normal break-words">
                {shoe.name}
              </Link>
            ) : (
                <><span className="whitespace-normal break-words">{shoe.name}</span></>
            )}
          </h3>
        </div>
      ))}
    </Carousel>
  );
};

// Export the PopularShoesCarousel component
export default PopularShoesCarousel;
