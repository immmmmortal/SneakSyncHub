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
    const openButtonRef = useRef<HTMLImageElement>(null);

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

                <ul className="[&_li]:p-3 mt-24 flex-grow flex flex-col gap-2 p-2 text-white">
                    <li className="hover:bg-sneakers-second hover:rounded-2xl">
                        <FontAwesomeIcon icon={faHouse} className="mr-2"/>
                        SneakSyncHub
                    </li>
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
                <footer className="p-3 text-white">
                    <div className="hover:bg-sneakers-second rounded-xl p-3">
                        <FontAwesomeIcon icon={faWandMagicSparkles}
                                         className="mr-2"/>
                        Upgrade Plan
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
                    className={`fixed top-3.5 left-3 p-2 text-white rounded z-50 transition-transform duration-300 ease-in-out`}
                    onClick={() => setIsOpen(true)}
                >
                    <FontAwesomeIcon icon={faBars} className="text-2xl"/>
                </button>

                {/* Button for closing sidebar */}
                <button
                    className={`fixed top-3.5 left-3 p-2 text-white rounded z-50 transition-transform duration-300 ease-in-out ${
                        isOpen ? '' : 'hidden'
                    }`}
                    onClick={() => setIsOpen(false)}
                >
                    <FontAwesomeIcon icon={faBars}
                                     className="text-2xl"/>
                </button>

                <div className="ml-14 mt-1">
                    {children}
                </div>
            </div>

            {/* Manage User Component */}
            <div>
                <ManageUserComponent sidebarRef={sidebarRef}
                                     openButtonRef={openButtonRef}/>
            </div>
        </div>
    );
};

export default MainContentComponent;
