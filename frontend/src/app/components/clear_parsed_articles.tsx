'use client'

import React, {useState} from 'react';
import {toast} from 'react-toastify';
import {getCsrfToken} from "@/app/lib/utils";

const ClearParsedArticles: React.FC = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClearArticles = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch('https://localhost:8000/api/shoes/clear', {
                method: 'DELETE',
                credentials: 'include', // This is necessary to send cookies
                headers: {
                    'X-CSRFToken': getCsrfToken() || '', // Include CSRF token
                    'Content-Type': 'application/json', // Optional, based on your API requirements
                },
            });

            if (response.ok) {
                setSuccess(true);
                toast.success('Articles cleared successfully!');
            } else {
                const errorData = await response.json();
                toast.error('Failed to clear articles');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred while clearing articles.');
        } finally {
            setLoading(false);
            setModalOpen(false); // Close the modal after the action
        }
    };

    // Close modal when clicking outside of it
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Check if the click is on the overlay (background)
        if (e.currentTarget === e.target) {
            setModalOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => setModalOpen(true)}
            >
                Clear Articles
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    onClick={handleOverlayClick} // Attach the click handler to the overlay
                >
                    <div
                        className="bg-sneakers-first rounded-2xl p-5 shadow-lg z-60"
                    >
                        <h2 className="text-lg font-bold mb-5">Confirm
                            Action</h2>
                        <p>Are you sure you want to clear ALL articles from
                            history?</p>
                        <div className="mt-4 flex justify-end">
                            <button
                                className="mr-2 px-4 py-2 bg-sneakers-second rounded"
                                onClick={() => setModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={`px-4 hover:bg-red-700 py-2 rounded ${loading ? 'bg-gray-400' : 'bg-red-500 text-white'}`}
                                onClick={handleClearArticles}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Clear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClearParsedArticles;
