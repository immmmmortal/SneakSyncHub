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

export function safeParseSizes(sizes: string): string[] {
    try {
        // Replace single quotes with double quotes to make the string JSON-compatible
        const sanitizedSizes = sizes.replace(/'/g, '"');
        return JSON.parse(sanitizedSizes);
    } catch {
        // Return an empty array if parsing fails
        return [];
    }
}
