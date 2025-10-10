import Sideheader from '@/Components/Sideheader';
import React from 'react';

// function 

const Home = () => {
    return <>
        <div className='bg-gray-300 grid grid-cols-4'>
            <Sideheader/>
            <div className=' col-span-3'>
                <div className='bg-amber-600 m-5 flex'>
                    <p>
                        Filleter
                    </p>
                </div>
                <div className='flex items-center justify-center bg-white p-15 rounded-2xl shadow-2xl shadow-black'>
                    <img src='/assets/logo.png' className='h-60 w-60' />
                    
                </div>
            </div>
        </div>
    </>;
}

export default Home