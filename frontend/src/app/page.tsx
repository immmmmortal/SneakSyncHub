"use client";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import PopularShoesCarousel from "@/app/components/shoes_carousel";
import ShoesNewsComponent from "@/app/components/shoes_news";
import { useRouter } from 'next/navigation'

config.autoAddCss = false;

export default function Home() {
  const router = useRouter();

  const openModal = () => {
    // Get the current query parameters (if any) and add/modify them
    const currentQuery = new URLSearchParams(window.location.search);
    currentQuery.set("telegramModal", "true");

    // Use `pathname` and `search` to correctly update the URL with the query params
    router.push(`${window.location.pathname}?${currentQuery.toString()}`);
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Home page</h1>
      <div className="relative w-full mt-10">
        <div className="absolute w-full pr-10">
          <h1 className="text-2xl font-bold mb-8">Trending now</h1>
          <PopularShoesCarousel />
          <h1 className="text-2xl font-bold mt-8 mb-8">News</h1>
          <ShoesNewsComponent />
        </div>
      </div>
    </>
  );
}
