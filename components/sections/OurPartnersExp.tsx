import { thirdFont } from '@/fonts';
import Image from 'next/image'
import Link from 'next/link';
import React from 'react'

const OurPartnersExp = () => {
  const logos = ["Sweet&Sour.jpeg","Sky.jpeg","Artima.jpeg","Shosh.jpeg","YesStyle.jpeg","Facefull.jpeg"];
  // const logos = ["Sweet&Sour.jpeg","Sky.jpeg","Artima.jpeg","Vogacloset.jpeg","Shosh.jpeg","YesStyle.jpeg","Facefull.jpeg"];
  return (

        <section className="w-[98vw] md:w-[90vw] text-start  bg-transparent text-lovely pt-8 ">
          {/* <h2 
              className={`${thirdFont.className} tracking-normal  text-4xl md:text-5xl  lg:text-6xl font-semibold   mb-8`}>
              Our Partners</h2> */}
          {/* <h2 className="text-center text-lg xl:text-xl font-extralight leading-8 ">We are trusted by the world’s most innovative teams</h2> */}
          
          <div className="logos group flex gap-8 relative overflow-hidden whitespace-nowrap  [mask-image:_linear-gradient(to_right,_transparent_0,_white_128px,white_calc(100%-128px),_transparent_100%)]">
            <div className=" gap-8 animate-slide-left-infinite group-hover:animation-pause w-max flex  ">
              {/* <!-- Ensure that the images cover entire screen width for a smooth transition --> */}
              {/* <Image width={40} height={40} className="mx-4 inline h-16" src="https://svgshare.com/i/rD7.svg" alt="GitHub" /> */}
{logos.map((logo,index)=> 
<div key={index} className='relative overflow-hidden w-24 h-24 md:w-44 md:h-44 rounded-full border-4 border-creamey'>
<Image  fill className=" inline object-cover" src={`/partners/${logo}`} alt="" />
</div>
)}
{/* <Image width={100} height={100} className="mx-4 inline h-16" src="/Partners/1.png" alt="Google" />
<Image width={100} height={100} className="mx-4 inline h-16" src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" />
<Image width={100} height={100} className="mx-4 inline h-16" src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" /> */}
{/* <Image width={100} height={100} className="mx-4 inline h-16" src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" alt="Spotify" /> */}
{/* <Image width={100} height={100} className="mx-4 inline h-16" src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" /> */}

            </div>
        
            {/* <!-- Duplicate of the above for infinite effect (you can use javascript to duplicate this too) --> */}
            <div className="animate-slide-left-infinite group-hover:animation-pause h-[200] w-max flex gap-8">
              {/* <!-- Ensure that the images cover entire screen width for a smooth transition --> */}
              {logos.map((logo,index)=> 
<div key={index} className='relative overflow-hidden w-24 h-24 md:w-44 md:h-44 rounded-full border-4 border-creamey'>
<Image  fill className=" inline object-cover" src={`/partners/${logo}`} alt="" />
</div>
)}
              {/* <Image width={100} height={100} className="mx-4 inline h-16" src="https://svgshare.com/i/rD7.svg" alt="GitHub" /> */}
{/* <Image width={100} height={100} className="mx-4 inline h-16" src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" />
<Image width={100} height={100} className="mx-4 inline h-16" src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" /> */}
{/* <Image width={100} height={100} className="mx-4 inline h-16" src="https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.svg" alt="Slack" /> */}
{/* <Image width={100} height={100} className="mx-4 inline h-16" src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" alt="Spotify" />
<Image width={100} height={100} className="mx-4 inline h-16" src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" /> */}

            </div>
          </div>

        </section>
        
  )
}

export default OurPartnersExp