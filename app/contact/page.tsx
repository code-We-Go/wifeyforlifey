import Image from "next/image";
import ContactForm from "../components/ContactForm";
import { thirdFont } from "@/fonts";

export default function ContactUsPage() {
  return (
    <div className="flex bg-pattern1 custom-container h-auto  md:min-h-[calc(100vh-128px)] items-center justify-center bg-gray-100">
      <div className=" inset-0   w-full  flex  py-8 md:px-8 important! justify-center items-center backdrop-blur-[3px] bg-black/20 ">
     
      <div className="mx-auto  flex  flex-col rounded-2xl bg-pinkey p-8 shadow-lg md:flex-row">
        {/* Image Column */}
        <div className="md:w-1/2">
          <Image
          width={400}
          height={500}
            src="/characters/CallCenterGirlie.png" // This will be replaced with the actual image later
            alt="Contact Us"
            className="h-full aspect-auto w-full rounded-2xl object-cover"
          />
        </div>

        {/* Form Column */}
        <div className="md:w-1/2 md:pl-8">
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