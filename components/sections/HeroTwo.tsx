'use client'
import { lifeyFont } from '@/fonts'
import React from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'

const HeroTwo = () => {
  const { scrollYProgress } = useScroll()

  const mainImageScale = useTransform(scrollYProgress, [0, 0.15], [0.2, 1])
  const mainImageOpacity = useTransform(scrollYProgress, [0, 0.2], [0.5, 1])
  const textY = useTransform(scrollYProgress, [0, 0.2], [100, 0])
  const textOpacity = useTransform(scrollYProgress, [0, 0.1], [0.5, 1])
  const ringY = useTransform(scrollYProgress, [-0.2, 0.15], [160, 0])

  const ringRotation = useTransform(scrollYProgress, [0, 0.2], [90, -30])
  const glassesRotation = useTransform(scrollYProgress, [0, 0.3], [60, -20])
  const fyonkaRotation = useTransform(scrollYProgress, [0, 0.2], [-60, 30])
  const ringScale = useTransform(scrollYProgress, [0, 0.15], [0.5, 1])
  const textX = useTransform(scrollYProgress, [-0.3, 0.1], [170, 0])
  const textXr = useTransform(scrollYProgress, [-0.5, 0.15], [-150, 0])
  const glassesXr = useTransform(scrollYProgress, [0, 0.2], [-200, 0])
  const paragraphX = useTransform(scrollYProgress, [-0.2, 0.01], [40, 0])
  const partyX =useTransform(scrollYProgress,[-0.2,0.15],[150,0])
  const sectionY = useTransform(scrollYProgress, [0, 0.4], [30, 0])
  const headingY = useTransform(scrollYProgress, [0, 0.1], [30, 0])
  const rightRingRotation = useTransform(scrollYProgress, [0, 0.5], [30, 12])
  
  // Pre-calculate opacity values for paragraphs
  const paragraphOpacities = [
    useTransform(scrollYProgress, [0, 0.1], [0.5, 1]),
    useTransform(scrollYProgress, [0, 0.1], [0.2, 1]),
    useTransform(scrollYProgress, [0, 0.1], [0.2, 1]),
    useTransform(scrollYProgress, [0, 0.1], [0.2, 1])
  ]

  return (
    <div className='w-full bg-creamey min-h-screen md:h-[150vh] flex px-4 md:px-12 py-24 md:py-32'>
        <div className=' max-sm:w-[40%] w-1/2 flex pl-8 lg:pl-16 xl:pl-32 flex-col justify-start md:items-start relative'>
        <motion.div 
          style={{
            scale: mainImageScale,
            opacity: mainImageOpacity
          }}
          className='absolute bottom-[10vh] md:top-[20vh] -right-[30vw] md:-right-[200px]'>
            <Image className='aspect-auto' src={"/hero/Bride 2_The Efficeint Planner.png"} alt={"ultimate best friend"} width={400} height={50}/>
        </motion.div>
        <motion.div 
          style={{
            x:glassesXr,
            y:ringY,
            rotate: glassesRotation,
            scale: ringScale,
            opacity: textOpacity
          }}
          className='hidden md:block absolute z-30 bottom-[20vh] left-[2vw]'>
                  <Image className=' aspect-auto' width={120} height={50} alt='glasses' src={'/hero/Wifey For Lifey Illustrations-09.png'}></Image>
        </motion.div>
   
        <motion.h1 
          style={{
            x: textXr,
            opacity: textOpacity
          }}
          className={`  text-lovely text-5xl md:text-7xl lg:text-9xl font-normal ${lifeyFont.className}`}>plan</motion.h1>
        <motion.h1 
          style={{
            x: textXr,
            opacity: textOpacity,
            transform: 'scaleY(1.3)'
          }}
          className='text-lovely italic text-2xl md:text-4xl lg:text-5xl  font-light'>LIKE A PRO ..</motion.h1>
        <motion.div 
          style={{
            y:ringY,
            rotate: ringRotation,
            scale: ringScale,
            opacity: textOpacity
          }}
          className=''>
                  <Image className='aspect-auto' width={100} height={50} alt='ring' src={'/hero/WifeyForLifey Illustrations-26.png'}></Image>
        </motion.div>
      
        </div>
        <div className='relative max-sm:w-[60%] w-1/2 flex flex-col justify-start lg:pt-[5vh] items-start md:items-center'>
        <motion.div 
          style={{
            x: textX,
            opacity: textOpacity
          }}
          className=' text-lovely max-w-[40vw] md:max-w-[30vw] lg:max-w-[25vw] text-sm sm:text-base md:text-lg'>
            
              <motion.p
                style={{
                  x: paragraphX,
                  opacity: paragraphOpacities[0]
                }}
                className=''
              >
                Wifey for lifey is your ultimate bridal bestie ! From 
                planning tools to stress-free tips, we&apos;ve got everything you need 
                to make your dream day a reality. it&apos;s not just about wedding-it&apos;s about you
              </motion.p>

        </motion.div>
        <motion.div 
          style={{
            y: sectionY,
            opacity: textOpacity
          }}
          className='text-lovely max-sm:text-sm uppercase text-sm ml-[15vw] md:ml-[10vw] sm:ml-[10vw] lg:ml-[8vw]'>
                <motion.h1 
                  style={{
                    x:partyX,
                    // y: headingY,
                    opacity: textOpacity,
                    transform: 'scaleY(1.3)'
                  }}
                  className='italic text-2xl md:text-4xl lg:text-5xl  font-light'>party like A</motion.h1>
                <motion.h1 
                  style={{
                    x:partyX,
                    opacity: textOpacity,
                    transform: 'scaleY(1.3)'
                  }}
                  className={`${lifeyFont.className} italic text-5xl md:text-7xl lg:text-9xl font-normal lowercase`}>bride</motion.h1>
        </motion.div>
        <motion.div 
          style={{
            y:ringY,
            rotate: fyonkaRotation,
            scale: ringScale,
            opacity: textOpacity
          }}
          className='rotate-12 absolute lg:bottom-[25vh] bottom-[30vh] right-[2vw]  md:right-[5vw] sm:right-[5vw] lg:right-[15vw]'>
          {/* // className='rotate-12  -top-[5vh] -right-[30vw]  md:right-[5vw] sm:right-[5vw] lg:right-[6vw]'> */}
                  <Image className='aspect-auto' width={120} height={50} alt='fyonka' src={'/hero/WifeyForLifey Illustrations-28.png'}></Image>
        </motion.div>
        </div>
    </div>
  )
}

export default HeroTwo