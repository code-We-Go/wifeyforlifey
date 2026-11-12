import React from 'react'
import Image from 'next/image'

const FlipCard = () => {
  const cardStyles = {
    card: {
      perspective: '800px',
      width: '160px', // w-40 equivalent
    },
    cardContent: {
      transformStyle: 'preserve-3d' as const,
      textAlign: 'center' as const,
      position: 'relative' as const,
    //   padding: '80px', // p-20 equivalent
      transition: 'transform 1s',
      color: 'white',
      fontWeight: 'bold',
    },
    cardFront: {
      backfaceVisibility: 'hidden' as const,
      position: 'absolute' as const,
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      padding: '0px', // p-8 equivalent
      backgroundColor: '#dc2626', // bg-pink-600 equivalent
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardBack: {
      backfaceVisibility: 'hidden' as const,
      transform: 'rotateY(0.5turn)',
      position: 'absolute' as const,
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      padding: '32px', // p-8 equivalent
      backgroundColor: '#14b8a6', // bg-teal-500 equivalent
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const cardContent = e.currentTarget.querySelector('.card__content') as HTMLElement
    if (cardContent) {
      cardContent.style.transform = 'rotateY(0.5turn)'
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const cardContent = e.currentTarget.querySelector('.card__content') as HTMLElement
    if (cardContent) {
      cardContent.style.transform = 'rotateY(0turn)'
    }
  }

  return (
    <div 
      className="card" 
      style={cardStyles.card}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card__content" style={cardStyles.cardContent}>
        <div className="card__front h-[60vh] w-[20vw]" style={cardStyles.cardFront}>
          <Image fill alt='first phase'  className='object-contain aspects-auto' src={"/experience/exp1.jpeg"}/>
        </div>
        <div className="card__back" style={cardStyles.cardBack}>
          <h2>Back</h2>
        </div>
      </div>
    </div>
  )
}

export default FlipCard