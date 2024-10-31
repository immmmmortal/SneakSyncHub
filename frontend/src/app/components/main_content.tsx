'use client'

import React, {useEffect, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faBars,
    faCircleInfo,
    faGear,
    faHouse,
    faMagnifyingGlass,
    faWandMagicSparkles
} from "@fortawesome/free-solid-svg-icons";
import ManageUserComponent from "@/app/components/manage_user_icon";
import Link from "next/link";


const MainContentComponent: React.FC<{
    children: React.ReactNode
}> = ({children}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const openButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            setIsTransitioning(true);
        } else {
            const timer = setTimeout(() => setIsTransitioning(false), 300); // Match animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <div className="relative flex overflow-auto h-full w-full">
            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed will-change-transform top-0 left-0 h-full transition-transform duration-300 ease-in-out bg-sneakers-first z-50 flex flex-col text-gray-300 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{width: '16rem'}} // Fixed width for the sidebar
            >

                <ul className="[&_li]:p-4 mt-24 flex-grow flex flex-col gap-2 p-2 text-white">
                    <Link href="/">
                        <li className="hover:bg-sneakers-second hover:rounded-2xl">
                            <FontAwesomeIcon icon={faHouse}
                                             className="mr-2"/>
                            SneakSyncHub
                        </li>
                    </Link>
                    <Link href="/search"
                          className="hover:bg-sneakers-second hover:rounded-2xl">
                        <li>
                            <FontAwesomeIcon icon={faMagnifyingGlass}
                                             className="mr-2"/>Search
                        </li>
                    </Link>
                    <li className="hover:bg-sneakers-second hover:rounded-2xl">
                        <FontAwesomeIcon icon={faGear} className="mr-2"/>
                        Settings
                    </li>
                    <li className="hover:bg-sneakers-second hover:rounded-2xl">
                        <FontAwesomeIcon icon={faCircleInfo}
                                         className="mr-2"/>
                        About
                    </li>
                </ul>
                <footer
                    className="p-4 ml-2 mr-2 mb-2 hover:bg-sneakers-second rounded-xl text-white">
                    <div className="flex flex-row">
                        <FontAwesomeIcon
                            icon={faWandMagicSparkles}
                            className="mr-2 self-center"/>
                        <div
                            className="flex flex-col items-start">
                            <div
                                className="flex items-start">
                                Upgrade Plan
                            </div>
                            <div className="flex text-sm text-gray-500">
                                Get unique features
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Main Content Area */}
            <div
                ref={contentRef}
                className={`flex-1 transition-all duration-300 ease-in-out ${
                    isOpen ? 'ml-64' : 'ml-0'
                }`}
            >
                {/* Button for opening sidebar */}
                <button
                    ref={openButtonRef}
                    className={`fixed top-3.5 left-3 p-2 text-white rounded z-50 transition-transform duration-300 ease-in-out`}
                    onClick={() => setIsOpen(true)}
                >
                    <FontAwesomeIcon icon={faBars} className="text-2xl"/>
                </button>

                {/* Button for closing sidebar */}
                <button
                    ref={openButtonRef}
                    className={`fixed top-3.5 left-3 p-2 text-white rounded z-50 transition-transform duration-300 ease-in-out ${
                        isOpen ? '' : 'hidden'
                    }`}
                    onClick={() => setIsOpen(false)}
                >
                    <FontAwesomeIcon icon={faBars}
                                     className="text-2xl"/>
                </button>

                <div className="ml-14 h-full p-3.5">
                    {children}
                </div>
            </div>

            {/* Manage User Component */}
            <div className="fixed top-3.5 right-6">
                <ManageUserComponent sidebarRef={sidebarRef}
                                     openButtonRef={openButtonRef}/>
            </div>
        </div>
    );
};

export default MainContentComponent;
