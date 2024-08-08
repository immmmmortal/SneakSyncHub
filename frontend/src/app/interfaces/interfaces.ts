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