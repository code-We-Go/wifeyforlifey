import Image from "next/image";
import ContactForm from "../components/ContactForm";
import { thirdFont } from "@/fonts";

export default function ContactUsPage() {
  return (
    <div className="flex bg-pattern1  h-auto  md:min-h-[calc(100vh-128px)] items-center justify-center bg-gray-100">
      <div className=" inset-0   w-full  flex  py-8 md:px-8 important! justify-center items-center backdrop-blur-[3px] bg-black/10 ">
        <div className="mx-auto  flex  flex-col rounded-2xl bg-pinkey p-8 shadow-lg md:flex-row">
          {/* Image Column */}
          <div className="hidden  md:w-1/2 relative  md:h-[87vh] md:flex md:max-h-[90vh] items-center duration-700 justify-center group">
            <Image
              fill
              src="/joinNow/Callcentergirlie_portrait2.png"
              alt="Contact Us"
              className="h-full w-full rounded-2xl object-cover"
            />
            <div className="absolute px-4 py-2 bottom-0 left-0 w-full  text-creamey/50 group-hover:text-creamey bg-lovely/40 transition-all duration-700 group-hover:bg-lovely/90 rounded-2xl">
              <h3 className={`${thirdFont.className} tracking-normal`}>
                {" "}
                Contact Us
              </h3>
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:info@example.com">info@shopwifeyforlifey.com</a>
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                <a href="tel:+1234567890">+20 1055691340</a>
              </p>
              <p>
                <strong>Address:</strong> Cairo,Egypt,Masr EL-Gedida,Salah
                EL-Din st.
              </p>
            </div>
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
          <div className="md:hidden  py-2 bottom-0 left-0 w-full  text-lovely rounded-2xl">
            <h2
              className={`${thirdFont.className} font-bold text-3xl tracking-normal`}
            >
              Contact Us
            </h2>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:info@example.com">info@shopwifeyforlifey.com</a>
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              <a href="tel:+1234567890">+20 1055691340</a>
            </p>
            <p>
              <strong>Address:</strong> Cairo,Egypt,Masr EL-Gedida,Salah EL-Din
              st.
            </p>
          </div>

          {/* Form Column */}
          <div className="md:w-1/2 md:pl-8 h-full">
            <h2
              className={`${thirdFont.className} tracking-normal text-lovely mb-4 text-3xl md:text-5xl font-bold `}
            >
              Send us a message
            </h2>
            <p className="mb-6 text-lovely/90">
              Your satisfaction is our top priority, and we are committed to
              providing exceptional service and support
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
