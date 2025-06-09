import { thirdFont } from '@/fonts'
import React from 'react'
import { Button } from "@/components/ui/button";

const Newsletters = () => {
  return (
    <section className="bg-creamey py-16">
    <div className="container-custom text-center ">
      <h2 className={`${thirdFont.className} text-4xl md:text-5xl  lg:text-6xl font-semibold text-lovely mb-4`}>
        Join Our Community
      </h2>
      <p className="text-muted-foreground mb-8">
        Subscribe to our newsletter for the latest product drops, exclusive
        content, and special offers.
      </p>
      <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
        <Input
          type="email"
          placeholder="Your email address"
          className="rounded-full flex-1"
        />
        <Button type="submit" className="hover:bg-everGreen bg-lovely text-creamey rounded-full">
          Subscribe
        </Button>
      </form>
    </div>
  </section>
  )
}

export default Newsletters

function Input({
    className,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <input
        className={`px-4 py-2 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
        {...props}
      />
    );
  }