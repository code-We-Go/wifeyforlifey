import React from 'react'
import Link from 'next/link'

const HoverButton = ({ href, text }: { href: string, text: string }) => {
  return (
    <Link href={href} className="relative max-md:text-sm px-6 py-3 font-semibold md:font-bold text-white group">
    <span className="absolute inset-0 w-full h-full rounded-lg transition duration-300 ease-out transform -translate-x-2 -translate-y-2 bg-red-300 group-hover:translate-x-0 group-hover:translate-y-0"></span>
    <span className="absolute inset-0 w-full h-full rounded-lg border-2 border-black"></span>
        <span className="relative">{text}</span>
</Link>
  )
}

export default HoverButton