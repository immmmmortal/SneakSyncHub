'use client'

import React, {useEffect, useState} from 'react';
import {Shoe} from "@/app/interfaces/interfaces";
import ArticleInfoComponent from "@/app/components/article_info";
import SearchBarComponent from "@/app/components/search_bar";
import FilterSectionComponent from "@/app/components/filter_section";
import {toast} from "react-toastify";
import DefaultViewComponent from "@/app/components/default_view";

const SearchPage = () => {
    const [shoes, setShoes] = useState<Shoe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchShoes = async () => {
            try {
                const response = await fetch('https://localhost:8000/api/fetch', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    setError(`HTTP error! Status: ${response.status}`);
                    return;
                }

                const result = await response.json();
                const {article_data} = result;

                if (Array.isArray(article_data)) {
                    setShoes(article_data);
                } else {
                    setError('Unexpected response format');
                }
            } catch (error) {
                setError(`Failed to fetch shoes`);
                toast.error(error as string);
            } finally {
                setLoading(false);
            }
        };

        fetchShoes();
    }, []);

    const handleSearch = async (searchQuery: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('https://localhost:8000/api/fetch', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({article: searchQuery}),
            });

            if (!response.ok) {
                setError(`HTTP error! Status: ${response.status}`);
                toast.error(error as string);
                return;
            }

            const article_data = await response.json();

            if (Array.isArray(article_data)) {
                setShoes(prevShoes => [...article_data, ...prevShoes]); // Prepend the new data
            } else if (article_data) {
                setShoes(prevShoes => [article_data, ...prevShoes]); // Prepend the single new item
            } else {
                setError('Unexpected response format');
                toast.error(error as string);
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred while fetching the data. Please try again.');
            toast.error(error as string);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        setError(null);

        try {
            const response = await fetch(`https://localhost:8000/api/shoes/${id}/delete`, {
                method: "DELETE",
                credentials: 'include',
            });

            if (response.ok) {
                setShoes(prevShoes => prevShoes.filter(shoe => shoe.id !== id));
            } else {
                const errorData = await response.json();
                setError(`HTTP error! Status: ${response.status}. ${errorData.details}`);
            }
        } catch (error) {
            setError('An error occurred while deleting the shoe. Please try again.');
            toast.error('Error:' + error as string);
        }
    };

    return (
        <div className="relative h-full p-3">
            <div className="text-2xl">Search for articles</div>
            <div className="h-95percents">
                <div className="p-3 flex flex-col mr-2 h-full">
                    <div>
                        <div className="mt-10">
                            <SearchBarComponent
                                article_loading={loading}
                                width={''}
                                placeholder={'Search article*'}
                                onSearch={handleSearch} // Pass the search handler
                            />
                        </div>
                    </div>
                    <h2 className="text-xl mt-14 mb-5 text-gray-400">History</h2>
                    <div className="h-full">
                        <div className="flex gap-14 h-full items-start">
                            <div className="flex flex-grow">
                                {shoes.length > 0 ? (
                                    <ArticleInfoComponent
                                        handleDelete={handleDelete}
                                        shoes={shoes}
                                    />
                                ) : (
                                    <DefaultViewComponent/>
                                )}
                            </div>
                            <div className="mt-5 flex self-stretch">
                                <FilterSectionComponent/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
