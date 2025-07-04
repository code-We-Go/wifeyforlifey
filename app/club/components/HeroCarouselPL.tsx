'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

const HeroCarousel = () => {
  useEffect(() => {
const interval = setInterval(() => {
    setActiveIndex((prev) => prev === (images.length - 1)? 0 : prev + 1);
}
    
, 5000);
console.log(activeIndex);
console.log('3000')

    return () => clearInterval(interval);
  }, []);
    
  const [activeIndex, setActiveIndex] = useState(0);

  // Array of images to display in the carousel
  const images = [
    "/experience/exp1.jpeg",
    "/experience/exp2.jpeg",
    "/experience/exp3.jpeg",
  ];

  // Function to handle moving to the next slide
  // const nextSlide = () => {
  //   setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
  // };

  // Function to handle moving to the previous slide
  // const prevSlide = () => {
  //   setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  // };

  return (
    <div id="default-carousel" className=" relative my-4 md:my-16 w-full h-[50vh] sm:h-[60vh] max-h-[95vh] md:h-[calc(100vh-64px)]" data-carousel="slide">
      <div className="relative  overflow-hidden rounded-lg h-full">
        {images.map((src, index) => (
          <div
            key={index}
            className={`absolute max-md:top-0 h-auto max-h-[90vh] md:h-screen inset-0 transition-opacity duration-700 ease-in-out ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={src}
              layout="fill"
              className="object-contain"
              alt={`Slide ${index + 1}`}
              priority={index === activeIndex} // Set priority for active slide
            />
          </div>
        ))}
      </div>

      {/* Carousel navigation dots */}
      {/* <div className="absolute z-30 flex space-x-3 bottom-5 left-1/2 transform -translate-x-1/2">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`w-3 h-3 rounded-full ${index === activeIndex ? 'bg-primary' : 'bg-gray-300'}`}
            aria-label={`Slide ${index + 1}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div> */}

      {/* Previous Button */}
      {/* <button
        type="button"
        className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer"
        onClick={prevSlide}
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover:bg-white/50">
          <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </span>
      </button>  */}

      {/* Next Button */}
      {/* <button
        type="button"
        className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer"
        onClick={nextSlide}
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover:bg-white/50">
          <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button> */}
    </div>
  );
}

export default HeroCarousel;
