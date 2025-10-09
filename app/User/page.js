"use client"
import Link from 'next/link';
import React, { useState } from 'react';



const User = () => {

    const [selectedCollege, setSelectedCollege] = useState("");
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');

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

    const handleData = (e) => {
        e.preventDefault()
        // console.log(name)
        // console.log(number)
        // console.log(selectedCollege )
        // Here write the code of checking user data and according to error change the color of border of respective form filed 
        setSelectedCollege('')
        setName('')
        setNumber('')
    }

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
                    <h1 className='text-4xl font-medium m-5'>Enter Your Details</h1>
                    <form className='flex items-center justify-center flex-col' onSubmit={handleData}>

                        <input type="text" className='border-2 border-gray-500 h-8 w-85 rounded-md m-3 text-xl p-5 focus:border-black outline-none' placeholder='Enter Your Name' value={name} onChange={(e) => {
                            setName(e.target.value)
                        }} />

                        <input type="text" className='border-2 border-gray-500 h-8 w-85 rounded-md m-3 text-xl p-5 focus:border-black outline-none' placeholder='Enter Your Contact Number' value={number} onChange={(e) => {
                            setNumber(e.target.value)
                        }} />

                        <select
                            value={selectedCollege}
                            onChange={(e) => setSelectedCollege(e.target.value)}
                            className="w-80 p-3 border-2 border-gray-400 rounded-md text-lg focus:border-blue-500 outline-none transition-colors duration-300">
                            <option value="">-- Choose a College --</option>
                            {colleges.map((college, index) => (
                                <option key={index} value={college}>
                                    {college}
                                </option>
                            ))}
                        </select>

                        <button className='text-xl font-medium w-60 p-3 mt-5 bg-blue-400 rounded-4xl hover:bg-blue-200 active:scale-95'>Submit</button>
                    </form>
                </div>

            </div>
        </div>
    </>;
}

export default User