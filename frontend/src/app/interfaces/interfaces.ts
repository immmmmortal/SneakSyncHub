import React from "react";

export interface submitButtonProps {
  isPending: boolean;
}

export interface userCredentials {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}

export interface responseFormat {
  status: number;
  message: string;
}

export interface ClickOutsideRefInterface {
  sidebarRef: React.RefObject<HTMLDivElement>;
  openButtonRef: React.RefObject<HTMLButtonElement>;
}

export interface Shoe {
  sale_price: string;
  parsed_from: string;
  price_history: PriceHistory[];
  description: string;
  id: number;
  name: string;
  price: string;
  url: string;
  image: string;
  article: string;
  sizes: string;
}

export interface PriceHistory {
  price: number;
  date_recorded: string;
}

export interface NumericInputProps {
  placeholder?: string; // Optional placeholder prop
  className?: string; // Optional className prop for styling
  value?: string; // Controlled value
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Change handler
  isDisabled?: boolean;
}

export interface DesiredPrice {
  shoe: Shoe;
  desired_price: string;
}
