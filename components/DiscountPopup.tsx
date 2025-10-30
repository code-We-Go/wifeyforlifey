"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

interface PopupData {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  link: string;
}

export default function DiscountPopup() {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchPopup = async () => {
      try {
        const response = await fetch("/api/popup");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.popup) {
            setPopup(data.popup);

            // Check if popup was dismissed before
            // const dismissedPopup = localStorage.getItem(
            //   `popup-dismissed-${data.popup._id}`
            // );
            // if (!dismissedPopup) {
            //   setIsOpen(true);
            // }
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error("Error fetching popup:", error);
      }
    };

    fetchPopup();
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    if (popup) {
      // Save to localStorage to prevent showing again in this session
      localStorage.setItem(`popup-dismissed-${popup._id}`, "true");
    }
  };

  if (!isOpen || !popup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full min-h-[50vh] lg:min-h-[75vh] flex flex-col md:flex-row  max-w-md md:max-w-2xl lg:max-w-3xl  mx-4 bg-creamey rounded-lg shadow-xl">
        <button
          onClick={closePopup}
          className="absolute top-2 right-2 text-lovely"
        >
          <X size={24} />
        </button>

        {popup.imageUrl && (
          <div className="relative w-full md:w-1/2 h-[300px] md:h-auto md:min-h-full overflow-hidden rounded-md">
            <Image
              src={popup.imageUrl}
              alt={popup.title}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
        <div className="p-8 flex flex-col md:w-1/2 justify-center gap-4">
          <h1 className="mb-2  w-full text-center text-2xl font-bold text-lovely">
            {popup.title}
          </h1>
          <p className="mb-4 text-lovely/90 whitespace-pre-line">
            {popup.description}
          </p>

          <Link
            href={popup.link}
            className="block w-full py-2 text-center text-creamey bg-lovely/90 rounded-md hover:bg-lovely"
            onClick={closePopup}
          >
            {popup.buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}
