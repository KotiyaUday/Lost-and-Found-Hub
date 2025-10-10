"use client"
import Sideheader from '@/Components/Sideheader';
import React, { useState } from 'react';

const Home = () => {
    
    const [college, setCollege] = useState("");
    const [sortOrder, setSortOrder] = useState("");
    const [category, setCategory] = useState("");

    const colleges = [
        "Marwadi University",
        "Atmiya University",
        "RK University",
        "Darshan University",
        "VVP Engineering College",
        "Christ College",
        "Gardi Vidyapith",
        "Government Engineering College Rajkot",
        "Saurashtra University",
        "Om Engineering College"
    ];
    const categories = [
        "Electronics",
        "Wallet",
        "Jewellery",
        "Documents",
        "Clothing",
        "Other"
    ];

    let posts = [
        {status:'Lost',category:'elctonic',title:'Buds',time:'9/10/2025  10:20:89'},
        {status:'Lost',category:'elctonic',title:'Buds',time:'9/10/2025  10:20:89'},
        {status:'Lost',category:'elctonic',title:'Buds',time:'9/10/2025  10:20:89'},
        {status:'Lost',category:'elctonic',title:'Buds',time:'9/10/2025  10:20:89'},
        {status:'Lost',category:'elctonic',title:'Buds',time:'9/10/2025  10:20:89'}
    ]

    const post = posts.map((post,index) => {
        return <div  key={index} className='flex items-center justify-center p-5 rounded-2xl border m-5'>
            <img src='/assets/logo.png' className='h-60 w-60' />
            <div className='flex flex-col text-black font-bold text-2xl h-full'>
                <h5 className='text-right mb-10 text-xl font-medium'>
                    {post.status}
                </h5>
                
                <div>
                <h2>
                    Category : {post.category}
                </h2>

                <h2>
                    Title : {post.title}
                </h2>

                <h2>
                    Date & Time : {post.time}
                </h2>
                </div>
            </div>
        </div>;
    });

    return <>
        <div className='bg-gray-300 grid grid-cols-4'>
            <Sideheader/>

            <div className='col-start-2 col-end-5 flex flex-col items-center'>
                <div className='flex m-5 p-5 gap-5 items-center justify-center'>
                    <div className="text-white border border-black rounded">
                        <select
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="p-2 rounded-md text-black border-2 border-gray-300 focus:border-black outline-none w-50"
                        >
                        <option value="">-- Select College --</option>
                        {colleges.map((clg, index) => (
                            <option key={index} value={clg}>
                            {clg}
                            </option>
                        ))}
                        </select>
                    </div>

                    {/* Sort By Time Dropdown */}
                    <div className="text-white border border-black rounded">
                        <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="p-2 rounded-md text-black border-2 border-gray-300 focus:border-black outline-none w-50"
                        >
                        <option value="">-- Select Order --</option>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                        </select>
                    </div>

                    {/* Filter by Category Dropdown */}
                    <div className="text-white border border-black rounded">
                        <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="p-2 rounded-md text-black border-2 border-gray-300 focus:border-black outline-none"
                        >
                        <option value="">-- Select Category --</option>
                        {categories.map((cat, index) => (
                            <option key={index} value={cat}>
                            {cat}
                            </option>
                        ))}
                        </select>
                    </div>
                </div>
                <div className='h-300 overflow-y-auto pb-50' style={{scrollbarWidth: 'none'}}>
                    {post}
                </div>
            </div>
        </div>
    </>;
}

export default Home