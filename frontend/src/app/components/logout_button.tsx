'use client'

import {toast} from "react-toastify";
import {useAuth} from "@/app/lib/auth";
import {useRouter} from "next/navigation";

const LogoutButtonComponent = () => {
    const {setAuthenticated} = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        const res = await fetch("https://localhost:8000/api/logout", {
            method: 'POST',
            credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.message);
            return;
        }

        setAuthenticated(false)
        router.push("/")
        toast.success(data.message);
    }

    return (
        <button onClick={handleLogout}
                className="bg-orange-200 rounded-b w-40">
            Logout
        </button>
    )
};

export default LogoutButtonComponent;