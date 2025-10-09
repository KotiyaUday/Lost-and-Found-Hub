"use client"
import React, { useState } from 'react';

const User = () => {
  const [selectedCollege, setSelectedCollege] = useState("");
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [errors, setErrors] = useState({ name: false, number: false, college: false });

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
    e.preventDefault();

    const newErrors = {
      name: name.trim() === '',
      number: !/^\d{10}$/.test(number),
      college: selectedCollege === ''
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some(err => err);
    if (hasError) return;

    console.log({ name, number, selectedCollege });
    setSelectedCollege('');
    setName('');
    setNumber('');
  };

  return (
    <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center p-4">
      <div className="bg-white flex flex-col md:flex-row rounded-2xl shadow-2xl shadow-black w-full max-w-6xl overflow-hidden">

        {/* Image Section */}
        <div className="md:flex-1 w-full h-64 md:h-auto">
          <img
            src="/assets/registration.jpg"
            alt="Registration"
            className="w-full h-full object-cover rounded-t-2xl md:rounded-t-none md:rounded-l-2xl"
          />
        </div>

        {/* Form Section */}
        <div className="md:flex-1 flex flex-col justify-center items-center p-6 md:p-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-6 text-center">Enter Your Details</h1>

          <form className="flex flex-col w-full max-w-md" onSubmit={handleData}>

            {/* Name Field */}
            <div className="mb-3 w-full">
              <span className={`text-red-500 text-sm mb-1 block ${!errors.name && 'invisible'}`}>
                Name is required
              </span>
              <input
                type="text"
                className={`border-2 ${errors.name ? 'border-red-500' : 'border-gray-400'} h-12 rounded-md w-full px-4 text-base sm:text-lg focus:border-blue-500 outline-none transition-colors duration-300`}
                placeholder="Enter Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Contact Number Field */}
            <div className="mb-3 w-full">
              <span className={`text-red-500 text-sm mb-1 block ${!errors.number && 'invisible'}`}>
                Enter a valid 10-digit number
              </span>
              <input
                type="text"
                className={`border-2 ${errors.number ? 'border-red-500' : 'border-gray-400'} h-12 rounded-md w-full px-4 text-base sm:text-lg focus:border-blue-500 outline-none transition-colors duration-300`}
                placeholder="Enter Your Contact Number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>

            {/* College Field */}
            <div className="mb-3 w-full">
              <span className={`text-red-500 text-sm mb-1 block ${!errors.college && 'invisible'}`}>
                Please select a college
              </span>
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className={`border-2 ${errors.college ? 'border-red-500' : 'border-gray-400'} h-12 rounded-md w-full px-4 text-base sm:text-lg focus:border-blue-500 outline-none transition-colors duration-300`}
              >
                <option value="">-- Choose a College --</option>
                {colleges.map((college, index) => (
                  <option key={index} value={college}>{college}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="text-base sm:text-lg md:text-xl font-medium w-full h-12 bg-blue-400 rounded-full hover:bg-blue-500 active:scale-95 transition-all duration-200 mt-3"
            >
              Submit
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}

export default User;
