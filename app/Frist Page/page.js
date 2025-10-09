"use client"
import Link from 'next/link';
import React from 'react';

const User = () => {
    return <>
        <div className='h-screen w-screen bg-gray-200 flex items-center justify-center'>
            <div className='bg-white h-150 w-260 flex p-10 rounded-2xl shadow-2xl shadow-black'>
                <div className='flex-1 flex justify-center'>
                    <img
                        src="/assets/registration.jpg"
                        alt="Registration"
                        className='w-180'
                    />
                </div>

                <div className='flex-1 flex flex-col items-center justify-center'>
                    <p className='p-5 text-justify text-base'>
                        The sun dipped below the horizon, painting the sky in shades of orange and pink. A gentle breeze rustled through the trees, carrying the scent of rain. Somewhere in the distance, a dog barked, breaking the peaceful silence. It was one of those evenings that felt like the world had slowed down just for a moment.
                    </p>
                    <Link href='User'
                        className="flex items-center justify-center gap-3 bg-white border border-black rounded-lg px-5 py-3 mt-5 hover:shadow-xl active:scale-95" >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google logo"
                            className="w-6 h-6"
                        />
                        <span className="font-medium text-black">
                            Sign in with Google
                        </span>
                    </Link>

                </div>

            </div>
        </div>
    </>;
}

export default User