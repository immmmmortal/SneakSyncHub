'use client'

import {toast} from "react-toastify";
import {useAuth} from "@/app/lib/auth";
import {useRouter} from "next/navigation";
import {faArrowRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

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
        location.reload()
        toast.success(data.message);
    }

    return (
        <button onClick={handleLogout}
                className="">
            <FontAwesomeIcon
                icon={faArrowRightFromBracket} className="mr-3"/>
            Logout
        </button>
    )
};

export default LogoutButtonComponent;