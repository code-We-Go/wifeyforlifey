'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HoverButton from './HoverButton'

const HeroCarousel = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // Array of images with their respective paths and device-specific images
  const slides = [
    {
      desktopImage: "/hero/1de.jpg",
      mobileImage: "/hero/1me.jpg",
      path: "/pages/productsPage?categoryID=67e3c7112fe97723301d6ff4&season=all",
      title: "Shop Now",
      desktopPosition: { top: "80%", left: "48%" },
      mobilePosition: { top: "70%", left: "54%" }
    },
    {
      desktopImage: "/hero/2d.jpg",
      mobileImage: "/hero/2m.jpg",
      path: "/pages/productsPage?collectionID=67e2b261630c109896771f90",
      title: "Shop Now",
      desktopPosition: { top: "60%", left: "90%" },
      mobilePosition: { top: "60%", left: "30%" }
    },
    {
      desktopImage: "/hero/3d.jpg",
      mobileImage: "/hero/3m.jpg",
      path: "/pages/productsPage?categoryID=67e3c7112fe97723301d6ff4&season=all",
      title: "Shop Now",
      desktopPosition: { top: "80%", left: "46%" },
      mobilePosition: { top: "70%", left: "40%" }
    },
    {
      
      desktopImage: "/hero/4d.jpg",
      mobileImage: "/hero/4m.jpg",
      path: "/pages/productsPage?collectionID=67e2e60dad1aeb81400d9970",
      title: "Shop Now",
      desktopPosition: { top: "62%", left: "50%" },
      mobilePosition: { top: "65%", left: "50%" }
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => prev === (slides.length - 1) ? 0 : prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSlideClick = (path: string) => {
    console.log('Clicked path:', path); // Debug log
    if (path) {
      router.push(path);
    }
  };

  return (
    <div id="default-carousel" className="relative w-full mt-10 aspect-square md:aspect-video" data-carousel="slide">
    {/* <div id="default-carousel" className="relative w-full h-[55vh] md:h-[calc(100vh-56px)]"  data-carousel="slide"> */}
      <div className="relative w-full h-full ">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute w-full h-full inset-0 transition-opacity duration-700 ease-in-out ${
              index === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Desktop Image */}
            <div className="relative  w-full hidden md:block">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }} >
                <div className="w-full h-full" >
                  <Image
                    src={slide.desktopImage}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    alt={`Slide ${index + 1}`}
                    priority={index === activeIndex}
                  />
                </div>
                <div 
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{ 
                    top: slide.desktopPosition.top,
                    left: slide.desktopPosition.left,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <HoverButton href={slide.path} text={slide.title} />
                </div>
              </div>
            </div>
            {/* Mobile Image */}
            <div className="relative  aspect-square md:hidden">
            <div className="relative w-full" style={{ paddingTop: '100%' }} >
            <div className="w-full h-full" >
              <Image
                src={slide.mobileImage}
                fill
                sizes="100vw"
                className="object-cover"
                alt={`Slide ${index + 1}`}
                priority={index === activeIndex}
              />
              </div>
              </div>
              <div 
                className="absolute flex items-center justify-center"
                style={{ 
                  top: slide.mobilePosition.top,
                  left: slide.mobilePosition.left,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <HoverButton href={slide.path} text={slide.title} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Carousel navigation dots */}
      <div className="absolute z-30 flex gap-3 bottom-[50%] right-4 md:right-8 transform flex-col -translate-x-1/2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`w-3 h-3 rounded-full ${index === activeIndex ? 'bg-primary' : 'bg-gray-300'}`}
            aria-label={`Slide ${index + 1}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroCarousel;
