import { toast } from "react-toastify";
import React, { useState } from "react";
import { NumericInputProps } from "../interfaces/interfaces";

export const parseSizes = (sizes: string): string[] => {
  try {
    return JSON.parse(sizes.replace(/'/g, '"'));
  } catch (e) {
    toast.error("Failed to parse sizes:" + e);
    return [];
  }
};

export const getCsrfToken = () => {
  // Function to retrieve the CSRF token from cookies
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];
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

export const NumericInput: React.FC<NumericInputProps> = ({
  placeholder = "", // Default placeholder
  className = "", // Default empty string for additional classes
  value, // Controlled value from parent
  onChange, // Change handler from parent
  isDisabled,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (/^\d*$/.test(inputValue)) {
      // Only allow numbers
      if (onChange) {
        onChange(e);
      }
    }
  };

  return (
    <input
      disabled={isDisabled}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className={`bg-sneakers-second w-full
       border-b-2 focus:outline-none autofill:shadow-none
        autofill:bg-inherit autofill:text-inherit ${className}`}
      inputMode="numeric"
    />
  );
};
