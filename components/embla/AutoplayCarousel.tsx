'use client'
import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { EmblaOptionsType } from 'embla-carousel'

export function AutoplayCarousel() {
  const OPTIONS: EmblaOptionsType = {
    align: 'start',
    loop: true,
    slidesToScroll: 'auto'
  }

  const SLIDE_COUNT = 5
const SLIDES = Array.from(Array(SLIDE_COUNT).keys())

  const [emblaRef] = useEmblaCarousel()

  return (
    <div className="embla w-full" ref={emblaRef}>
      <div className="embla__container flex w-full flex-row gap-2">
      {SLIDES.map((index) => (
        <div className="embla__slide w-[100%]" key={index}>
          <div className="embla__slide__inner">Slide {index + 1}</div>
        </div>
      ))}
</div>
    </div>
  )
}
