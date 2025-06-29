import Image from "next/image";
import ContactForm from "../components/ContactForm";
import { thirdFont } from "@/fonts";

export default function ContactUsPage() {
  return (
    <div className="flex bg-pattern1 custom-container h-auto  md:min-h-[calc(100vh-128px)] items-center justify-center bg-gray-100">
      <div className=" inset-0   w-full  flex  py-8 md:px-8 important! justify-center items-center backdrop-blur-[3px] bg-black/10 ">
     
      <div className="mx-auto  flex  flex-col rounded-2xl bg-pinkey p-8 shadow-lg md:flex-row">
        {/* Image Column */}
        <div className="hidden  md:w-1/2 relative  md:h-[87vh] md:flex md:max-h-[90vh] items-center justify-center">
          <Image
           fill
            src="/joinNow/Callcentergirlie_portrait2.png"
            alt="Contact Us"
            className="h-full w-full rounded-2xl object-cover"
          />
        </div>
        <div className="md:hidden    md:max-h-[90vh] items-center justify-center">
          <Image
           width={400}
           height={300}
            src="/characters/Callcentergirlie.png"
            alt="Contact Us"
            className="h-full aspect-video mb-4 w-full rounded-2xl object-cover"
          />
        </div>

        {/* Form Column */}
        <div className="md:w-1/2 md:pl-8 h-full">
          <h2 className={`${thirdFont.className} tracking-normal text-lovely mb-4 text-5xl font-bold `}>Send us a message</h2>
          <p className="mb-6 text-gray-600">
            Your satisfaction is our top priority, and we are committed to providing exceptional service and support
          </p>
          <ContactForm />
        </div>
      </div>
      </div>
     
    </div>
  );
} 