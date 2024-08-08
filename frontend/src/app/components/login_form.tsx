'use client'

import {authenticate} from "@/app/lib/auth";
import SubmitButtonComponent from "@/app/components/submit_button";
import React, {useActionState} from 'react'
import {responseFormat} from "@/app/interfaces/interfaces";
import Link from "next/link";

const initialState: responseFormat = {
    status: 0,
    message: '',
}

const LoginComponent = () => {
    const [state, formAction, isPending] = useActionState(authenticate, initialState)

    return (
        <form action={formAction} className="space-y-3">
            <div
                className="flex-col rounded-lg bg-sneakers-first px-6 pb-4 pt-8 min-w-60 w-80">
                <h1 className="flex text-white justify-center mb-5">
                    Welcome back
                </h1>
                <div className="w-full">
                    <div>
                        <label
                            className=" block text-xs font-medium text-gray-900"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-4 text-sm outline-2 placeholder:text-gray-500 text-white bg-sneakers-first"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Email adress*"
                                required
                            />

                        </div>
                    </div>
                    <div className="">
                        <label
                            className="block text-xs font-medium text-gray-900"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-4 text-sm outline-2 placeholder:text-gray-500 text-white bg-sneakers-first"
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Password*"
                                required
                                minLength={6}
                            />

                        </div>
                    </div>
                </div>
                <SubmitButtonComponent isPending={isPending}/>
                <div className="flex">
                    <div
                        className="flex items-center justify-center w-full mt-4">
                        Don't have an account?<Link href=""
                                                    className="text-cyan-600 ml-2">Sign
                        Up</Link>
                    </div>
                </div>
                <div
                    className="flex h-8 items-end space-x-1"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {state.status == 0 ? null :
                        <p className='text-black'>{state.status} {state.message}
                        </p>}
                </div>
                <div
                    className="flex gap-3 flex-row text-gray-300 justify-between">
                    <span
                        className="border-b-2 border-gray-600
                        flex-1 h-3.5"></span>
                    <span> OR </span>
                    <span className="border-b-2 border-gray-600
                        flex-1 h-3.5"></span>
                </div>
            </div>

        </form>
    )
}

export default LoginComponent;