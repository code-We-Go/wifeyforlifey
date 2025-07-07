import { lifeyFont, thirdFont } from '@/fonts'
import React from 'react'

const AboutPage = () => {
  return (
    <div className={`container-custom flex justify-center items-center min-h-[calc(100vh-128px)] ${lifeyFont.className} h-auto font-semibold text-lovely bg-creamey`}>
      <div className="w-full max-w-4xl py-8 lg:py-16">
        <h1 className={`${thirdFont.className} tracking-normal text-4xl text-lovely  md:text-5xl mb-4 md:mb-8  font-semibold`}>About <span className={`${lifeyFont.className}`}>Us</span></h1>
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>

          <iframe 
            src="https://drive.google.com/file/d/1Iyeq7D5_9NFjjM-0lJONHp4XuXggmOng/preview"
            className="absolute top-0 left-0 w-full h-full border-0"
            allowFullScreen={true} 
            allow="encrypted-media"
          />
        </div>
      </div>
    </div>
  )
}

export default AboutPage