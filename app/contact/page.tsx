import Image from "next/image";
import ContactForm from "../components/ContactForm";

export default function ContactUsPage() {
  return (
    <div className="flex custom-container h-auto py-16 min-h-screen items-center justify-center bg-gray-100">
      <div className="mx-auto flex max-w-6xl flex-col rounded-lg bg-white p-8 shadow-lg md:flex-row">
        {/* Image Column */}
        <div className="md:w-1/2">
          <Image
          width={400}
          height={500}
            src="/contact-us-image.png" // This will be replaced with the actual image later
            alt="Contact Us"
            className="h-full aspect-auto w-full rounded-lg object-cover"
          />
        </div>

        {/* Form Column */}
        <div className="md:w-1/2 md:pl-8">
          <h2 className="mb-4 text-3xl font-bold text-gray-800">Send us a message</h2>
          <p className="mb-6 text-gray-600">
            Your satisfaction is our top priority, and we are committed to providing exceptional service and support
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
} 