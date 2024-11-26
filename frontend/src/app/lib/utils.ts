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


export const calculateDiscount = (originalPrice: string, salePrice: string) => {
    const original = parseFloat(originalPrice);
    const sale = parseFloat(salePrice);

    if (sale < original) {
      const difference = original - sale;
      return ((difference / original) * 100).toFixed(2); // Return percent difference
    }
    return "0"; // No discount
  };
