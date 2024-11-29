"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth";
import { Shoe } from "@/app/interfaces/interfaces";
import ArticleInfoComponent from "@/app/components/article_info";
import SearchBarComponent from "@/app/components/search_bar";
import FilterSectionComponent from "@/app/components/filter_section";
import DefaultViewComponent from "@/app/components/default_view";
import ArticleInfoLoadingComponent from "@/app/components/article_info_loading";
import { toast } from "react-toastify";
import Link from "next/link";
import ClearParsedArticles from "@/app/components/clear_parsed_articles";
import MultipleSelectComponent from "@/app/components/multiple_select";
import { Tooltip } from "react-tooltip";
import { MdRefresh } from "react-icons/md";
import RescrapeModalComponent from "../components/rescrape_modal_component";

const SearchPage = () => {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [initialMinPrice, setInitialMinPrice] = useState<number>(0);
  const [initialMaxPrice, setInitialMaxPrice] = useState<number>(200);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const [isKeywordFiltered, setIsKeywordFiltered] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([
    "Nike",
    "Adidas",
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage the modal visibility

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchShoes = async () => {
      try {
        const response = await fetch("https://localhost/api/fetch", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 429) {
            // Handle rate limit exceeded
            toast.error(
              "You have exceeded the rate limit for your subscription. Please upgrade to continue.",
            );
            return; // Skip further processing if rate limit is exceeded
          }
          setError(`HTTP error! Status: ${response.status}`);
          toast.error(response.statusText);
          return;
        }

        const result = await response.json();
        const { article_data } = result;

        if (Array.isArray(article_data)) {
          setShoes(article_data);

          // Calculate and set initial min and max prices
          const prices = article_data.map((shoe) => parseFloat(shoe.price));
          setInitialMinPrice(Math.min(...prices));
          setInitialMaxPrice(Math.max(...prices));
        } else {
          setError("Unexpected response format");
          toast.error(error);
        }
      } catch (error) {
        toast.error("Failed to fetch shoes");
      } finally {
        setLoading(false);
      }
    };

    fetchShoes();
  }, [isAuthenticated, error]);

  const handleSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://localhost/api/fetch", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article: searchQuery,
          parse_from: selectedSources,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Handle rate limit exceeded
          toast.error(
            "You have exceeded the rate limit for your subscription. Please upgrade to continue.",
          );
          return; // Skip further processing if rate limit is exceeded
        }
        setError(`HTTP error! Status: ${response.status}`);
        toast.error(error);
        return;
      }

      const result = await response.json();
      console.log(result);
      const newArticles = Array.isArray(result) ? result : [result];

      setShoes((prevShoes) => {
        const newShoes = [...prevShoes];
        const newArticleSet = new Set(newArticles.map((article) => article.id));

        // Remove existing articles from the list
        const filteredShoes = newShoes.filter(
          (shoe) => !newArticleSet.has(shoe.id),
        );

        // If the article exists, move it to the top
        const updatedShoes = newArticles.map((newArticle) => {
          const existingArticleIndex = prevShoes.findIndex(
            (shoe) => shoe.id === newArticle.id,
          );
          if (existingArticleIndex !== -1) {
            const updatedShoes = [...prevShoes];
            updatedShoes[existingArticleIndex] = newArticle; // Update the existing shoe with the new data
            return updatedShoes;
          }
          return newArticle; // If not found, just return the new article
        });

        // Add new articles to the top and return the updated list
        return [...updatedShoes, ...filteredShoes];
      });
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while fetching the data. Please try again.");
      toast.error(
        "An error occurred while fetching the data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);

    try {
      const response = await fetch(
        `https://localhost/api/shoes/${id}/delete`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        setShoes((prevShoes) => prevShoes.filter((shoe) => shoe.id !== id));
      } else {
        const errorData = await response.json();
        setError(
          `HTTP error! Status: ${response.status}. ${errorData.details}`,
        );
        toast.error(error);
      }
    } catch (error) {
      setError("An error occurred while deleting the shoe. Please try again.");
      toast.error(
        "An error occurred while deleting the shoe. Please try again.",
      );
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch("https://localhost/api/suggestions", {
        credentials: "include",
        method: "GET",
      });
      const data = await response.json();
      console.log(data);
      return data.last_scraped_articles.concat(data.most_popular_articles); // Combine both lists
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
    }
  };

  // Handler function to be passed to FilterSectionComponent
  const handleDataFetched = useCallback((data: any) => {
    setShoes(data);
  }, []);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="relative h-full">
      <div className="text-3xl font-bold">Search for articles</div>
      <div className="h-95percents">
        <div className="p-3 flex flex-col mr-2 h-full">
          <div>
            <div className={`mt-10 flex flex-row content-center`}>
              <SearchBarComponent
                fetchSuggestions={fetchSuggestions}
                is_article_loading={loading}
                width={""}
                placeholder={"Search article*"}
                onSearch={handleSearch}
                is_disabled={!isAuthenticated} // Pass the search handler
              />
              <MultipleSelectComponent onChange={setSelectedSources} />
            </div>
          </div>
          <div className="flex flex-row justify-between items-center mb-2 mt-10 min-h-12">
            <h2 className="text-xl text-gray-400 flex flex-row">
              <Link href="/search">History</Link>
              <Tooltip id="refresh-shoe" className="z-10"/>
              <button
                  onClick={handleModalOpen}
                className={`w-8 h-8 ml-2 rounded-full flex items-center justify-center ${loading ? "animate-spin" : ""}`}
                data-tooltip-id="refresh-shoe"
                data-tooltip-content={`This will re-scrape all fetched shoes and get updated info`}
                disabled={loading}
              >
                <MdRefresh
                  className={`w-10 h-10 ${loading ? "text-blue-500" : "text-gray-600"}`}
                />
              </button>
            </h2>
            <div className="">
              {isAuthenticated && shoes.length > 0 ? (
                <ClearParsedArticles shoes={shoes} setShoes={setShoes} />
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="h-full">
            <div className="flex gap-8 h-full items-start">
              <div className="flex flex-grow flex-row">
                {isAuthenticated ? (
                  <>
                    {loading ? (
                      <>
                        <div className="flex-auto">
                          <ArticleInfoLoadingComponent />
                          <ArticleInfoComponent
                            handleDelete={handleDelete}
                            shoes={shoes}
                          />
                        </div>
                      </>
                    ) : shoes.length > 0 ? (
                      <ArticleInfoComponent
                        handleDelete={handleDelete}
                        shoes={shoes}
                      />
                    ) : (
                      <DefaultViewComponent
                        title={
                          isKeywordFiltered
                            ? "No shoes match the selected filters"
                            : "Start searching to fill history"
                        }
                      />
                    )}
                  </>
                ) : (
                  <DefaultViewComponent title="Authorize to view search page" />
                )}
              </div>
              <div className="mt-5 flex self-stretch">
                {isAuthenticated ? (
                  <FilterSectionComponent
                    minPrice={initialMinPrice}
                    maxPrice={initialMaxPrice}
                    setIsKeywordFiltered={setIsKeywordFiltered}
                    onDataFetched={handleDataFetched} // Pass the handler
                  />
                ) : (
                  <FilterSectionComponent
                    minPrice={0}
                    maxPrice={200}
                    setIsKeywordFiltered={setIsKeywordFiltered}
                    onDataFetched={handleDataFetched} // Pass the handler
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <RescrapeModalComponent
        isOpen={isModalOpen}
        onClose={handleModalClose}
        shoes={shoes}
      />
    </div>
  );
};

export default SearchPage;
