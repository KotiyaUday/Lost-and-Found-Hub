import Link from 'next/link';
import React from 'react';
import Home from '@/app/Home/page';
import UserProfile from '@/app/User_Profile/page';

const Sideheader = () => {
    return <>
        <div className='flex h-screen w-80 flex-col justify-start p-5 bg-gray-200 rounded-2xl border-2 shadow-2xl shadow-black'>

            <div className=' w-full flex items-center justify-center'>
                <img src='/assets/logo.png' className='h-60 w-60' />
            </div>

            <div className='flex flex-col justify-center w-full h-100 text-2xl gap-5'>
                <Link href='/Home' className="flex items-center gap-3 hover:scale-95 active:scale-105">
                    <img src="https://www.svgrepo.com/show/22031/home-icon-silhouette.svg" alt="Home" className="w-6 h-6"/>
                    <span className="font-medium text-black">Home</span>
                </Link>

                <Link href='#' className="flex items-center gap-3 hover:scale-95 active:scale-105">
                    <img src="https://cdn-icons-png.flaticon.com/512/61/61088.png" alt="Home" className="w-6 h-6"/>
                    <span className="font-medium text-black">Search</span>
                </Link>

                <Link href='#' className="flex items-center gap-3 hover:scale-95 active:scale-105">
                    <img src="https://cdn-icons-png.flaticon.com/512/6537/6537820.png" alt="Home" className="w-6 h-6"/>
                    <span className="font-medium text-black">Add Post</span>
                </Link>

                <Link href='#' className="flex items-center gap-3 hover:scale-95 active:scale-105">
                    <img src="https://www.svgrepo.com/show/380090/send-message-dm.svg" alt="Home" className="w-6 h-6"/>
                    <span className="font-medium text-black">Message</span>
                </Link>

                <Link href='/User_Profile' className="flex items-center gap-3 hover:scale-95 active:scale-105">
                    <img src="https://www.svgrepo.com/show/343494/profile-user-account.svg" alt="User Profile" className="w-6 h-6"/>
                    <span className="font-medium text-black">Profile</span>
                </Link>
            </div>

            {/*  Home, Profile, Add Post, Search, Message */}

            {/* <div>
                Sttings
            </div> */}

        </div>
    </>;
}

export default Sideheader