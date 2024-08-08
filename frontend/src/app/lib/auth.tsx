'use client'

import {responseFormat, userCredentials} from "@/app/interfaces/interfaces";
import {redirect} from "next/navigation";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState
} from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    setAuthenticated: (auth: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
    children: ReactNode
}> = ({children}) => {
    const [isAuthenticated, setIsAuthenticatedState] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const isAuthenticatedCookie = document.cookie.split('; ').find(row => row.startsWith('is_authenticated='));
            setIsAuthenticatedState(!!isAuthenticatedCookie);
            setLoading(false);
        };

        checkAuth();
        window.addEventListener('cookieChange', checkAuth);

        return () => window.removeEventListener('cookieChange', checkAuth);
    }, []);

    const setAuthenticated = (auth: boolean) => {
        if (auth) {
            document.cookie = "is_authenticated=true; path=/";
        } else {
            document.cookie = "is_authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        setIsAuthenticatedState(auth);
        window.dispatchEvent(new Event('cookieChange'));
    };

    if (loading) {
        return null; // or a loading spinner
    }

    return (
        <AuthContext.Provider value={{isAuthenticated, setAuthenticated}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


export const authenticate = async (
    prevState: responseFormat,
    formData: FormData
): Promise<responseFormat> => {
    let user_data: userCredentials = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    };

    try {
        const res = await fetch("https://localhost:8000/api/token", {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user_data),
        });

        const data = await res.json();

        if (!res.ok) {
            return {
                status: data.status,
                message: data.message,
            }
        }
        console.log(data)
        
    } catch (error) {
        return {
            status: 500,
            message: 'Failed to authenticate due to network error'
        };
    }

    return redirect("/");
};


