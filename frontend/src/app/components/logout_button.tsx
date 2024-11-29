'use client'

import {toast} from "react-toastify";
import {useAuth} from "@/app/lib/auth";
import {useRouter} from "next/navigation";
import {faArrowRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const LogoutButtonComponent = () => {
    const {setAuthenticated} = useAuth()

    const handleLogout = async () => {
        const res = await fetch("https://localhost/api/logout", {
            method: 'POST',
            credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.message);
            return;
        }

        toast.success(data.message);
        setAuthenticated(false)
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