'use client'
import { lifeyFont, thirdFont } from '@/fonts'
import { fadeIn } from '@/variants/fadIn'
import { motion } from 'framer-motion'
import React from 'react'

const AboutPage = () => {
  return (
    <div className={`container-custom flex w-full justify-center  items-center min-h-[calc(100vh-128px)]  h-auto  text-lovely bg-creamey`}>
      <div className="w-full  py-8 lg:py-16 flex flex-col justify-center items-center gap-4 md:gap-8 lg:gap-16">
        {/* <h1 className={`${thirdFont.className} tracking-normal text-4xl text-lovely  md:text-5xl mb-4 md:mb-8  font-semibold`}>About <span className={`${lifeyFont.className}`}>Us</span></h1> */}
        <motion.div  variants={fadeIn({ direction: "up", delay: 0.2 })}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}

      className="text-start ">
        <h1 className={`${thirdFont.className} tracking-normal text-3xl md:text-4xl font-bold mb-2 md:mb-4 text-lovely`}>
        ❤️ About Wifey for Lifey
        </h1>
        <h5 className='font-semibold'>We&apos;re not just here for your wedding—we&apos;re here for your womanhood.
        </h5>
        <p className="text-base md:text-lg text-lovely/90 mb-4">
        <span className='font-extrabold'>Wifey for Lifey</span> was born from one deep truth: planning a wedding is one of the most emotional journeys a woman takes—and no one was doing enough to emotionally support her through it. So we stepped in—not just with pretty planners, but with genuine guidance, heartfelt sisterhood, and practical tools that help her feel calm, clear, and confident.        </p>
        <p className="text-base md:text-lg  leading-relaxed">
        But here&apos;s the thing: we&apos;re not stopping at weddings.        </p>
        <p className='text-base md:text-lg'>We believe a woman&apos;s story doesn&apos;t end when she says &quot;I do.&quot; It&apos;s just beginning. That&apos;s why <span className='font-extrabold'>Wifey for Lifey</span> is evolving into an empowerment-driven lifestyle brand—one that supports women not just as brides, but as humans building homes, careers, families, and futures.
        </p>

        </motion.div>     
        <div className="relative w-full md:w-[80vw] lg:w-[70vw]  aspect-video" >

          <iframe 
            src="https://drive.google.com/file/d/1Iyeq7D5_9NFjjM-0lJONHp4XuXggmOng/preview"
            className="absolute top-0 left-0 w-full h-full border-0"
            allowFullScreen={true} 
            allow="encrypted-media"
          />
        </div>
        <motion.div  variants={fadeIn({ direction: "up", delay: 0.2 })}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}

      className="text-start ">
        <h1 className={`${thirdFont.className} tracking-normal text-2xl md:text-3xl font-semibold mb-2 md:mb-4 text-lovely`}>
        🌸 Why We&apos;re Here
        </h1>

        <p className="text-base md:text-lg text-lovely/90 mb-4">
        To guide, support, and celebrate women through every stage of life—starting with her wedding, and growing with her through everything that comes next.</p>
 
        <p className='text-base md:text-lg'>We want to build a<span className='font-extrabold'> womanhood empowerment empire</span>—yes, empire—where our content, products, and experiences uplift, equip, and emotionally support women with realness, warmth, and wisdom.
        </p>

        </motion.div> 
        <motion.div  variants={fadeIn({ direction: "up", delay: 0.2 })}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}

      className="text-start ">
        <h1 className={`${lifeyFont.className} tracking-normal text-2xl md:text-3xl font-semibold mb-2 md:mb-4 text-lovely`}>
        ✨ What We Offer
        </h1>

        <p className="text-base md:text-lg text-lovely/90 mb-4">
        <span className='font-bold tracking-wide scale-y-125'>Stress-Free Wedding Support</span>: Through our detailed planners and heartfelt content, we help brides navigate the chaos with calm, clarity, and confidence.        </p>
        <p className="text-base md:text-lg text-lovely/90 mb-4">
        <span className='font-bold tracking-wide scale-y-125'>Emotional Empowerment</span>: We listen deeply and create tools that support not just logistics—but also her heart.
        </p>
        <p className="text-base md:text-lg text-lovely/90 mb-4">
        <span className='font-bold tracking-wide scale-y-125'>Women-Owned, Women-Loved</span>: We collaborate with local women-owned businesses and spotlight their magic.
        </p>
        <p className="text-base md:text-lg text-lovely/90 mb-4">
        <span className='font-bold tracking-wide scale-y-125'>Lifelong Sisterhood</span>: From planning a wedding to planning her baby shower, <span className='font-extrabold'>Wifey for Lifey</span> grows with her.
        </p>
 
    

        </motion.div> 
        <motion.div  variants={fadeIn({ direction: "up", delay: 0.2 })}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}

      className="text-start ">
        <h1 className={`${thirdFont.className} tracking-normal text-2xl md:text-3xl font-semibold mb-2 md:mb-4 text-lovely`}>
        💖 Our Brand Values
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-creamey border border-lovely/10 rounded-xl p-4 shadow-2xl flex flex-col items-center text-start">
            <span className="text-xl mb-2">🌷</span>
            <h6 className="font-bold mb-1">Empathy First</h6>
            <p className="text-sm text-lovely/95">We listen with intention. Whether she&apos;s a bride, a business owner, or a mother-to-be—every woman deserves to feel heard, seen, and supported without judgment.</p>
          </div>
          <div className="bg-creamey border border-lovely/10 rounded-xl p-4 shadow-2xl flex flex-col items-center text-start">
            <span className="text-xl mb-2">🌿</span>
            <h6 className="font-bold mb-1">Empowerment Always</h6>
            <p className="text-sm text-lovely/95">We&apos;re not here to fix her—we&apos;re here to remind her she&apos;s powerful. Our content, tools, and community are designed to build confidence, clarity, and calm.</p>
          </div>
          <div className="bg-creamey border border-lovely/10 rounded-xl p-4 shadow-2xl flex flex-col items-center text-start">
            <span className="text-xl mb-2">🧵</span>
            <h6 className="font-bold mb-1">Personalization</h6>
            <p className="text-sm text-lovely/95">No two love stories—or life journeys—are the same. We tailor our experiences to honor her uniqueness, from her budget to her big dreams.</p>
          </div>
          <div className="bg-creamey border border-lovely/10 rounded-xl p-4 shadow-2xl flex flex-col items-center text-start">
            <span className="text-xl mb-2">💬</span>
            <h6 className="font-bold mb-1">Honesty with Heart</h6>
            <p className="text-sm text-lovely/95">We speak truth gently. No fluff. No fake pressure. Just real, thoughtful advice that helps her make informed decisions, not impulsive ones.</p>
          </div>
          <div className="bg-creamey border border-lovely/10 rounded-xl p-4 shadow-2xl flex flex-col items-center text-start">
            <span className="text-xl mb-2">🎀</span>
            <h6 className="font-bold mb-1">Thoughtfulness in Every Detail</h6>
            <p className="text-sm text-lovely/95">Every product, post, and package is crafted with care. From the way we design our planner to the tone in our voice notes—we obsess over the little things because they matter.</p>
          </div>
          <div className="bg-creamey border shadow-2xl border-lovely/10 rounded-xl p-4  flex flex-col items-center text-start">
            <span className="text-xl mb-2">👑</span>
            <h6 className="font-bold mb-1">Women for Women</h6>
            <p className="text-sm text-lovely/95">We actively champion women-owned businesses, creatives, and voices—because when women rise together, we all win.</p>
          </div>
        </div>

        </motion.div> 
                <motion.div  variants={fadeIn({ direction: "up", delay: 0.2 })}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}

      className="text-start ">
        <h1 className={`${thirdFont.className} tracking-normal text-2xl md:text-3xl font-semibold mb-2 md:mb-4 text-lovely`}>
        💫 Our Promise
        </h1>

        <p className="text-base md:text-lg text-lovely/90 mb-4">
Whether you’re planning your big day, starting a new chapter, or just trying to hold it all together—we’ve got you. With honest support, meaningful products, and a community that feels like home. </p>
        <p className='text-base md:text-lg'>Welcome to your safe space, your planning partner, and your lifelong hype squad.

        </p>
        <p className='text-base md:text-lg'>Welcome to <span className='font-extrabold'>Wifey for Lifey.</span>

        </p>

        </motion.div>
      </div>
    </div>
  )
}

export default AboutPage