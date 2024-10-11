import {toast} from "react-toastify";

export const parseSizes = (sizes: string): string[] => {
    try {
        return JSON.parse(sizes.replace(/'/g, '"'));
    } catch (e) {
        toast.error('Failed to parse sizes:' + e);
        return [];
    }
};


export const getCsrfToken = () => {
    // Function to retrieve the CSRF token from cookies
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
};