'use client'

import React from "react";
import {submitButtonProps} from "@/app/interfaces/interfaces";
import {useAuth} from "@/app/lib/auth";
import {useRouter} from "next/navigation";

const SubmitButtonComponent: React.FC<submitButtonProps> = ({isPending}) => {
    const {setAuthenticated} = useAuth()
    const router = useRouter();

    return (
        <button className="p-2.5 bg-sneakers-button w-full rounded mt-10"
                type="submit"
                aria-disabled={isPending}>
            Submit
        </button>
    )
}

export default SubmitButtonComponent;