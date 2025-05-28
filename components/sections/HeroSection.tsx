'use client'
import React from 'react'
import Image from 'next/image'
import {motion} from 'framer-motion'
import { fadeIn } from '@/variants/fadIn'
import { lifeyFont } from '@/fonts'

const HeroSection = () => {
  return (
    <div className='w-full pt-32 relative h-[calc(100vh-64px)] md:h-[calc(100vh-128px)] bg-creamey'>
        <div className='relative h-[60%] sm:h-[65%] flex pb-[25vh] lg:pb-[15vh] justify-start lg:w-1/2 items-center  sm:pb-[25vh] lg:justify-start lg:items-start'>
            <motion.div 
              variants={fadeIn({ direction: 'right', delay: 0.2 })}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.6 }}
            className='relative text-lovely max-sm:text-sm uppercase  ml-[5vw] sm:ml-[10vw] lg:ml-[8vw] ' >
                <h1 className='italic ' style={{ transform: 'scaleY(1.3)' }}>your bridal</h1>
                <h1 className='italic ' style={{ transform: 'scaleY(1.3)' }}>Bestfriend and </h1>
                <div className="flex items-start justify-start text-start">
  <div className="uppercase italic">
    <p className="leading-[0.9] m-0">Begin your bridal</p>
    <p className="leading-[0.9] m-0">journey now !!</p>
  </div>
  <div className="flex flex-col h-full justify-start">
    <p
      className={`italic text-5xl leading-[0.9] lowercase sm:text-6xl lg:text-8xl p-0 m-0 ${lifeyFont.className}`}
    >
      Community
    </p>
  </div>
</div>
                <div className='absolute -bottom-[5vh] -left-[5vw] sm:-left-[4vw] lg:-left-[2vw]'>
                  <Image className='-rotate-12' width={50} height={50} alt='ring' src={'/hero/WifeyForLifey Illustrations-26.png'}></Image>
                </div>
                <div className='absolute rotate-12 -top-[5vh] right-[5vw] sm:right-[10vw] lg:right-[6vw]'>
                  <Image width={50} height={50} alt='ring' src={'/hero/WifeyForLifey Illustrations-28.png'}></Image>
                </div>
            </motion.div>
        </div>
        <div className='w-full relative bottom-0 md:flex left-0 h-[40%] sm:h-[35%] border-t-lovely border-2 bg-pinkey'>
<motion.div 
                variants={fadeIn({ direction: 'left', delay: 0.2 })}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.6 }}
className='aspect-auto absolute -top-[200px] sm:-top-[330px] right-[3vw] sm:right-[9vw] md:right-[8vw]'>
        <Image className=' max-sm:scale-105 max-md:scale-125 md:aspect-auto'
  src="/hero/Brides Together.png"
  alt="Brides Together"
  width={500}
  height={500}
/>

</motion.div>
        </div>
    </div>
  )
}

export default HeroSection