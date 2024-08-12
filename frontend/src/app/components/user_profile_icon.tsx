'use client'

import React, {useState, useRef, useEffect} from 'react';
import Image from 'next/image';
import defaultUserProfileIcon
    from '../static/images/default_profile_picture.jpg';
import LogoutButtonComponent from '@/app/components/logout_button';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBrush, faGear, faUser} from '@fortawesome/free-solid-svg-icons';
import {ClickOutsideRefInterface} from "@/app/interfaces/interfaces";

const UserProfileIcon: React.FC<ClickOutsideRefInterface> = ({
                                                                 sidebarRef,
                                                                 openButtonRef
                                                             }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
        // Check if click is outside dropdown and not on sidebar or open button
        if (
            dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
            (!sidebarRef.current || !sidebarRef.current.contains(event.target as Node)) &&
            (!openButtonRef.current || !openButtonRef.current.contains(event.target as Node))
        ) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative cursor-pointer">
            <Image
                onClick={toggleDropdown}
                className="w-10 h-auto rounded-full"
                src={defaultUserProfileIcon}
                alt="defaultImage"
            />
            {isDropdownOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute shadow-lg min-w-max w-72 rounded-xl mt-4 right-0 bg-sneakers-first"
                >
                    <ul className="p-2 rounded-lg">
                        <div className="[&_li]:p-3">
                            <li className="hover:bg-sneakers-second hover:rounded-2xl w-full">
                                <FontAwesomeIcon className="mr-3"
                                                 icon={faUser}/>
                                My Sneakers
                            </li>
                            <li className="hover:bg-sneakers-second hover:rounded-2xl w-full">
                                <FontAwesomeIcon className="mr-3"
                                                 icon={faBrush}/>
                                Customize Hub
                            </li>
                            <li className="hover:bg-sneakers-second hover:rounded-2xl w-full">
                                <FontAwesomeIcon className="mr-3"
                                                 icon={faGear}/>
                                Settings
                            </li>
                        </div>
                        <li className="hover:bg-sneakers-second hover:rounded-2xl w-full mt-3 p-3">
                            <LogoutButtonComponent/>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserProfileIcon;
