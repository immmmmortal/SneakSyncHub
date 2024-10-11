'use client'

import {authenticate, signUp, useAuth} from "@/app/lib/auth";
import SubmitButtonComponent from "@/app/components/submit_button";
import React, {useActionState, useEffect, useState} from 'react'
import {responseFormat} from "@/app/interfaces/interfaces";
import Image from "next/image";
import googleicon from '../static/images/google_icon.png'
import githubicon from '../static/images/github_icon.png'
import {toast} from "react-toastify";

const initialState: responseFormat = {
    status: 0,
    message: '',
}

const LoginComponent = ({closeModal}: {
    closeModal: () => void
}) => {
    const [loginState, loginAction, loginIsPending] = useActionState(authenticate, initialState);
    const [signUpState, signUpAction, signUpisPending] = useActionState(signUp, initialState);
    const {setAuthenticated} = useAuth()
    const [formType, setFormType] = useState<'login' | 'signup'>('login');

    useEffect(() => {
        if (loginState.status === 200) {
            toast.success(loginState.message);
            setAuthenticated(true)
            closeModal();
        } else if (loginState.status !== 0) {
            toast.info(loginState.message);
        }
    }, [loginState.status, loginState.message, closeModal, setAuthenticated]);

    useEffect(() => {
        if (signUpState.status === 200) {
            toast.success(signUpState.message);
            setAuthenticated(true);
            closeModal();
        } else if (signUpState.status !== 0) {
            toast.info(signUpState.message);
        }
    }, [signUpState.status, signUpState.message, closeModal, setAuthenticated]);


    return (
        <form action={formType === 'login' ? loginAction : signUpAction}
              className="space-y-3">
            <div
                className="flex-col rounded-lg bg-sneakers-first px-6 pb-4 pt-8 min-w-60 w-80">
                <h1 className="flex text-white justify-center mb-5">{formType === 'login' ?
                    'Welcome back' : 'Create an acccount'}
                </h1>
                <div className="w-full">
                    <div>
                        <label
                            className="block text-xs font-medium text-gray-900"
                            htmlFor="email">
                            Email
                        </label>
                        <div className="relative">
                            <input
                                className="autofill:bg-cyan-900 peer block w-full rounded-md border border-gray-200 py-[9px] pl-4 text-sm outline-2 placeholder:text-gray-500 text-white bg-sneakers-first"
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                placeholder="Email address"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label
                            className="block text-xs font-medium text-gray-900"
                            htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-4 text-sm outline-2 placeholder:text-gray-500 text-white bg-sneakers-first"
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                placeholder="Password"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                </div>
                <SubmitButtonComponent isPending={loginIsPending}/>
                <div className="flex">
                    <div
                        className="flex items-center justify-center w-full mt-4"
                    >
                        {formType === 'login' ? (
                            <>
                                Don&apos;t have an account?{' '}
                                <span
                                    className="text-cyan-600 ml-2 cursor-pointer"
                                    onClick={() => setFormType('signup')}
                                >
                                    Sign Up
                                </span>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <span
                                    className="text-cyan-600 ml-2 cursor-pointer"
                                    onClick={() => setFormType('login')}
                                >
                                    Log In
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <div
                    className="flex gap-3 flex-row text-gray-300 justify-between mt-8">
                    <span
                        className="border-b-2 border-gray-600 flex-1 h-3.5"></span>
                    <span> OR </span>
                    <span
                        className="border-b-2 border-gray-600 flex-1 h-3.5"></span>
                </div>
                <div>
                    <div
                        className="flex-1-3 border border-gray-600 h-14 rounded mt-2">
                        <div className="flex h-14 items-center">
                            <Image src={googleicon} alt="GoogleIcon"
                                   className="w-7 h-7 ml-3"/>
                            <div className="flex ml-5">Continue with Google
                            </div>
                        </div>
                    </div>
                    <div
                        className="flex border border-gray-600 h-14 rounded mt-2">
                        <div className="flex h-14 items-center">
                            <Image src={githubicon} alt="GitHubIcon"
                                   className="w-7 h-7 ml-3"/>
                            <div className="flex ml-5">Continue with GitHub
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default LoginComponent;