import Link from 'next/link';
import React from 'react';

const Sideheader = () => {
    return <>
        <div className='flex h-screen w-80 flex-col justify-start p-5 bg-slate-400 text-white rounded-r-4xl shadow-2xl shadow-gray-400 sticky left-0'>

            <div className=' w-full flex items-center justify-center'>
                <img src='/assets/logo.png' className='h-60 w-60' />
            </div>

            <div className='flex flex-col justify-center w-full h-100 text-2xl gap-5'>
                <Link href='/Home' className="flex items-center gap-3 hover:scale-95 active:scale-105">
                    <img src="https://static.vecteezy.com/system/resources/previews/021/948/181/non_2x/3d-home-icon-free-png.png" alt="Home" className="w-6 h-6"/>
                    <span className="font-medium">Home</span>
                </Link>

                <Link href='#' className="flex items-center gap-3 hover:scale-95 active:scale-105">
                    <img src="https://cdn-icons-png.flaticon.com/512/11741/11741045.png" alt="Home" className="w-6 h-6"/>
                    <span className="font-medium">Search</span>
                </Link>

                <Link href='/Add_Post' className="flex items-center gap-3 hover:scale-95 active:scale-105">
                    <img src="https://cdn-icons-png.flaticon.com/512/11741/11741042.png" alt="Home" className="w-6 h-6"/>
                    <span className="font-medium">Add Post</span>
                </Link>

                <Link href='/Message' className="flex items-center gap-3 hover:scale-95 active:scale-105">
                    <img src="https://cdn-icons-png.flaticon.com/512/526/526901.png" alt="Home" className="w-6 h-6"/>
                    <span className="font-medium">Message</span>
                </Link>

                <Link href='/User_Profile' className="flex items-center gap-3 hover:scale-95 active:scale-105">
                    <img src="https://cdn-icons-png.flaticon.com/512/5337/5337039.png" alt="User Profile" className="w-6 h-6"/>
                    <span className="font-medium">Profile</span>
                </Link>
            </div>

        </div>
    </>;
}

export default Sideheader