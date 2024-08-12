'use client'

import React, {useRef} from "react";
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

const MainContentComponent: React.FC<{
    children: React.ReactNode
}> = ({children}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const userProfileRef = useRef<HTMLDivElement>(null); //
    const openButtonRef = useRef<HTMLDivElement>(null); //


    return (
        <div className="flex flex-row h-full w-full">
            <div
                ref={sidebarRef}
                className={`transition-all flex text-gray-300 flex-col duration-200 ease-in-out bg-sneakers-first ${
                    isOpen ? 'w-1/4' : 'w-0'
                } z-0 overflow-hidden`}
            >
                <div>
                    <FontAwesomeIcon
                        icon={faBars}
                        className="fa-xl cursor-pointer p-4 text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    />
                </div>
                <ul className="flex text-nowrap flex-grow mr-1 ml-1 flex-col [&_li]:p-3">
                    <li className="hover:bg-sneakers-second hover:rounded-2xl w-full">
                        <FontAwesomeIcon className="mr-3" icon={faHouse}/>
                        SneakSyncHub
                    </li>
                    <li className="hover:bg-sneakers-second hover:rounded-2xl w-full">
                        <FontAwesomeIcon className="mr-3"
                                         icon={faMagnifyingGlass}/>
                        Search
                    </li>
                    <li className="hover:bg-sneakers-second hover:rounded-2xl w-full">
                        <FontAwesomeIcon className="mr-3" icon={faGear}/>
                        Settings
                    </li>
                    <li className="hover:bg-sneakers-second hover:rounded-2xl w-full">
                        <FontAwesomeIcon className="mr-3"
                                         icon={faCircleInfo}/>
                        About
                    </li>
                </ul>
                <footer className="text-nowrap mr-1 ml-1 mb-1 flex">
                    <div
                        className="hover:bg-sneakers-second hover:rounded-2xl w-full flex flex-row p-3">
                        <div className="flex items-center">
                            <FontAwesomeIcon className="mr-3"
                                             icon={faWandMagicSparkles}/>
                        </div>
                        <div className="flex flex-col">
                            <div>Upgrade Plan</div>
                            <div className="text-xs text-gray-400">Get
                                limited features
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            <div className="flex h-full w-full" ref={contentRef}>
                {!isOpen && (
                    <FontAwesomeIcon
                        icon={faBars}
                        ref={openButtonRef}
                        className="fa-xl cursor-pointer p-4"
                        onClick={() => setIsOpen(!isOpen)}
                    />
                )}
                <div
                    className={`flex-1 transition-all duration-200 ease-in-out ${
                        isOpen ? 'ml-1/4' : 'ml-0'
                    }`}
                >
                    {children}
                </div>
            </div>
            <div ref={userProfileRef}>
                <ManageUserComponent sidebarRef={sidebarRef}
                                     openButtonRef={openButtonRef}/>
            </div>
        </div>
    );
};

export default MainContentComponent;
