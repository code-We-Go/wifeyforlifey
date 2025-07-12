import React from 'react'
import Image from 'next/image'

const FlipingCardNew = ({exp,sol}:{exp:string,sol:string}) => { 
  return (
        <div className='group [perspective-[1000px]]'>
      <div className='relative h-full w-full rounded-2xl shadow-xl transition-all duration-1000 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]'>
        <div className='fixed inset-0'>
            <Image alt='exp1' src={exp} width={300} height={800} className='object-cover'></Image>
        </div>
        <div className='fixed inset-0 bg-black/80 h-full w-full  [transform:rotateY(180deg)] [backface-visbility:hidden]'>
        <Image alt='exp1' src={sol} width={300} height={800} className='object-cover'></Image>

        </div>
    </div>
    </div>
  )
}

export default FlipingCardNew