'use client'
import React, { useEffect, useRef, useState } from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'

type PropType = {
  slides: React.ReactNode[]
  options?: EmblaOptionsType
}

const EmblaCarousel: React.FC<PropType> = ({ slides, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    AutoScroll({ playOnInit: true, stopOnInteraction: false }) // start auto scroll immediately
  ])
  const [isPlaying, setIsPlaying] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!emblaApi) return

    const autoScroll = emblaApi.plugins()?.autoScroll
    if (!autoScroll) return

    setIsPlaying(autoScroll.isPlaying())

    const handleMouseEnter = () => autoScroll.stop()
    const handleMouseLeave = () => autoScroll.play()

    const container = containerRef.current
    container?.addEventListener('mouseenter', handleMouseEnter)
    container?.addEventListener('mouseleave', handleMouseLeave)

    // Update play state on embla events
    emblaApi
      .on('autoScroll:play', () => setIsPlaying(true))
      .on('autoScroll:stop', () => setIsPlaying(false))
      .on('reInit', () => setIsPlaying(autoScroll.isPlaying()))

    return () => {
      container?.removeEventListener('mouseenter', handleMouseEnter)
      container?.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [emblaApi])

  return (
    <div
      className="embla w-[100vw]"
      ref={containerRef}
    >
      <div className="embla__viewport  w-full" ref={emblaRef}>
        <div className="embla__container w-full flex justify-start gap-2">
          {slides?.map((slide,index) => (
           
            <div className="embla__slide" key={index}>
              {slide}
              {/* <div className="embla__slide__number"> */}
                {/* <span>{index + 1}</span> */}

              {/* </div> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmblaCarousel
