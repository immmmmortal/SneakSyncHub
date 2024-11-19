import React from "react";

export interface submitButtonProps {
    isPending: boolean
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
    sidebarRef: React.RefObject<HTMLDivElement>
    openButtonRef: React.RefObject<HTMLButtonElement>
}

export interface Shoe {
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