'use server'

import {cookies} from "next/headers";

const ProfileComponent = async () => {
    async function getData() {
        const res = await fetch('https://localhost/api/profile', {
            method: 'GET',
            credentials: 'include',
            headers: {
                Cookie: cookies().toString()
            },
        })

        if (!res.ok) {
            console.error("Failed to fetch data")
        }

        return res.json()
    }

    const data = await getData()
    return (
        <>
            Email: {data.user.email}
        </>
    )

};

export default ProfileComponent;