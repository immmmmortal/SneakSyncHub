'use client'

import React, {useState} from 'react';
import {toast} from 'react-toastify';
import {getCsrfToken} from "@/app/lib/utils";

interface ClearParsedArticlesProps {
    shoes: any[]; // Define the type based on your Shoe model
    setShoes: (shoes: any[]) => void;  // Function to update shoes
}

const ClearParsedArticles: React.FC<ClearParsedArticlesProps> = ({
                                                                     shoes,
                                                                     setShoes
                                                                 }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClearArticles = async () => {
        setLoading(true);

        try {
            const response = await fetch('https://localhost:8000/api/shoes/clear', {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': getCsrfToken() || '',
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                toast.success('Shoes cleared successfully!');
                setShoes([]);  // Clear shoes array
            } else {
                toast.error('Failed to clear articles');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred while clearing shoes.');
        } finally {
            setLoading(false);
            setModalOpen(false);
        }
    };

    return (
        <div>
            <button
                onClick={() => setModalOpen(true)}
                className="text-white hover:bg-red-500 rounded-xl p-3 bg-red-600 transition-colors duration-300">
                Clear History
            </button>

            {isModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50">
                    <div
                        className="bg-sneakers-second p-6 rounded shadow-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">
                            Are you sure you want to clear all parsed
                            articles?
                        </h3>
                        <p>This action cannot be undone.</p>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded">
                                Cancel
                            </button>
                            {loading ?
                                <div
                                    className="bg-red-600 flex justify-center items-center w-16 text-white px-4 py-2 rounded">
                                    <div
                                        className="w-4 h-4 border-4 border-t-4 border-t-white border-transparent rounded-full animate-spin"
                                    ></div>
                                </div>
                                :
                                <button
                                    onClick={handleClearArticles}
                                    className="bg-red-600 hover:bg-red-500 text-white w-16 rounded">Clear
                                </button>}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClearParsedArticles;
