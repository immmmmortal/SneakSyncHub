'use client';

import React from 'react';
import "react-toastify/dist/ReactToastify.css";
import {useAuth} from "@/app/lib/auth";
import Popup from "reactjs-popup";
import LoginComponent from "@/app/components/login_form";
import UserProfileIcon from "@/app/components/user_profile_icon";
import {ClickOutsideRefInterface} from "@/app/interfaces/interfaces";

const ManageUserComponent: React.FC<ClickOutsideRefInterface> = ({
                                                                     sidebarRef,
                                                                     openButtonRef
                                                                 }) => {
    const {isAuthenticated} = useAuth();

    return (
        <nav>
            <ul>
                <li>
                    {isAuthenticated ? (
                        <div className="flex flex-row">
                            <UserProfileIcon sidebarRef={sidebarRef}
                                             openButtonRef={openButtonRef}/>
                        </div>
                    ) : (
                        <>
                            <Popup trigger={<button type="button"
                                                    className="pl-4 pb-0.5 pr-4 border-amber-100 border-2 rounded-2xl hover:bg-gray-800
                                                    ">
                                Login
                            </button>} modal>
                                {(close: () => void) => (
                                    <LoginComponent closeModal={close}/>
                                )}
                            </Popup>
                        </>
                    )}
                </li>
            </ul>
        </nav>
    );
}

export default ManageUserComponent;
