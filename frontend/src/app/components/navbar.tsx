'use client';

import Image from "next/image";
import React from 'react';
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import {useAuth} from "@/app/lib/auth";
import LogoutButtonComponent from "@/app/components/logout_button";
import profilePic from '../static/images/default_profile_picture.jpg'
import Popup from "reactjs-popup";
import LoginComponent from "@/app/components/login_form";

const NavbarComponent = () => {
    const {isAuthenticated} = useAuth();

    return (
        <nav className="absolute right-6 mt-6">
            <ul>
                <li>
                    {isAuthenticated ? (
                        <div className="flex flex-row">
                            <LogoutButtonComponent/>
                            <Link href="/profile">
                                <Image src={profilePic}
                                       alt="Profile Picture"
                                       width="100"
                                       height="100"/>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Popup trigger={<button type="button"
                                                    className="pl-4 pb-0.5 pr-4 border-amber-100 border-2 rounded-2xl">
                                Login
                            </button>} modal>
                                {(close: React.MouseEventHandler<HTMLAnchorElement> | undefined) => (
                                    <LoginComponent/>
                                )}
                            </Popup>
                        </>
                    )}
                </li>
            </ul>
        </nav>
    );
}

export default NavbarComponent;
