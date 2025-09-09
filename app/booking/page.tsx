"use client";

import React from "react";
import Link from "next/link";

const BookingPage = () => {
  return (
    <div className="w-full min-h-screen bg-creamey h-auto flex flex-col justify-center items-center py-16">
      <h1 className="text-3xl font-bold text-lovely mb-8">Book Your Session</h1>
      <p className="text-center max-w-2xl mb-12 text-gray-700">
        As part of your mini subscription, you can book one of our exclusive sessions.
        Please select the session type you would like to attend:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-lovely/20">
          <h2 className="text-xl font-semibold text-lovely mb-3">All About Appliances</h2>
          <p className="text-gray-600 mb-6">
            Learn everything you need to know about selecting the right appliances for your home.
            Our experts will guide you through the essential considerations for each appliance type.
          </p>
          <Link href="/calendly" className="block w-full">
            <button className="w-full py-3 bg-lovely text-white rounded-lg font-medium hover:bg-lovely/90 transition">
              Book This Session
            </button>
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-lovely/20">
          <h2 className="text-xl font-semibold text-lovely mb-3">Self-Care During Gehaz Planning</h2>
          <p className="text-gray-600 mb-6">
            A heart-to-heart session dedicated to your wellbeing as a bride-to-be. Learn how to navigate
            the emotional side of gehaz planning and protect your inner peace during this exciting journey.
          </p>
          <Link href="/calendly2" className="block w-full">
            <button className="w-full py-3 bg-lovely text-white rounded-lg font-medium hover:bg-lovely/90 transition">
              Book This Session
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;