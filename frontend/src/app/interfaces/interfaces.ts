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
    openButtonRef: React.RefObject<HTMLDivElement>
}