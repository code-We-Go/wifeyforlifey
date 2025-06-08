'use client'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { EmblaOptionsType } from 'embla-carousel'
import './emblaScale.css'
import EmblaScaleCarousel from '../embla/EmblaScaleCarousel'
import { thirdFont } from '@/fonts'
const OPTIONS: EmblaOptionsType = { loop: true }
const SLIDE_COUNT = 5
export type Character = {name:string ,image:string,description:string}
import Image from 'next/image'
const characters = [
    {name:"wiig" , image:'/characters/Groom1TheCarefreeLover.png',description: "Awesomeeeee"},
    {name:"wiig" , image:'/characters/Groom1TheCarefreeLover.png',description: "Awesomeeeee"},
    {name:"wiig" , image:'/characters/Groom1TheCarefreeLover.png',description: "Awesomeeeee"},
    {name:"wiig" , image:'/characters/Groom1TheCarefreeLover.png',description: "Awesomeeeee"},
    {name:"wiig" , image:'/characters/Groom1TheCarefreeLover.png',description: "Awesomeeeee"},
    {name:"wiig" , image:'/characters/Groom1TheCarefreeLover.png',description: "Awesomeeeee"},
    {name:"wiig" , image:'/characters/Groom1TheCarefreeLover.png',description: "Awesomeeeee"},
    {name:"wiig" , image:'/characters/Groom1TheCarefreeLover.png',description: "Awesomeeeee"},

]
const SLIDES = characters
// const SLIDES = Array.from(Array(SLIDE_COUNT).keys())
const BrandCharacters = () => {
  return (
    
 <div className='relative w-full  h-auto pt-16  space-y-2 text-start bg-creamey container-custom'>
<h2 className={`${thirdFont.className} text-4xl md:text-5xl  font-semibold lg:text-6xl text-lovely`}>Brand&apos;s Characters</h2>
     <EmblaScaleCarousel slides={SLIDES} options={OPTIONS} />
     <div 
          className='rotate-12 md:absolute z-0 md:top-[10vh] max-md:hidden  md:right-[5vw] sm:right-[5vw] lg:right-[15vw]'>
          {/* // className='rotate-12  -top-[5vh] -right-[30vw]  md:right-[5vw] sm:right-[5vw] lg:right-[6vw]'> */}
                  <Image className='aspect-auto' width={120} height={50} alt='fyonka' src={'/hero/WifeyForLifeyIllustrations-14.png'}></Image>
        </div>
        <div 
          className='hidden md:block absolute z-0 top-[20vh] left-[8vw] -rotate-12'>
                  <Image className=' aspect-auto' width={120} height={50} alt='glasses' src={'/hero/Wifey For Lifey Illustrations-09.png'}></Image>
        </div>
 </div>
    
      
    
  )
}

export default BrandCharacters
